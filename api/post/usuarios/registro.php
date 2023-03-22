<?php
// =================================================================================
// HACER REGISTRO
// =================================================================================
// FICHERO: api/post/usuarios/registro.php
// MÉTODO: POST
// PETICIONES POST ADMITIDAS:
// * api/usuarios/registro -> Dar de alta un nuevo usuario
//      Params: login:login del usuario; nombre:nombre del usuario; pwd:password del usuario; pwd2:password de usuario repetido;
//              foto:foto del usuario. Es un elemento input de tipo file.
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
// =================================================================================
require_once('../../inc/config.php'); // Constantes, etc ...
require_once('../../inc/database.php');
// =================================================================================
// Se instancia la base de datos y el objeto producto
// =================================================================================
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// COMPROBAR SI EXISTE EL USUARIO EN LA BD
// =================================================================================
function comprobarExistencia($login, $db)
{
    $valorRet = false;
    $mysql    = 'select * from usuario where login=:LOGIN';

    $RESPUESTA = $db->select($mysql, [':LOGIN'=>$login]);
    if($RESPUESTA['CORRECTO'])
    {
      // Se comprueba si el resultado tiene un único registro y si el password coincide
      if( count($RESPUESTA['RESULT'])==1 && $RESPUESTA['RESULT'][0]['login'] == $login )
        $valorRet = true;
    }
    return $valorRet;
}
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R = [];  // Almacenará el resultado.
// =================================================================================
// Se cogen los parámetros de la petición
// =================================================================================
$PARAMS = $_POST;
// =================================================================================
// Se cogen el usuario y el login:
// =================================================================================
$login  = $PARAMS['login'];
$nombre = $PARAMS['nombre'];
$pwd    = $PARAMS['pwd'];
$pwd2   = $PARAMS['pwd2'];
$email  = $PARAMS['email'];

if( $pwd != $pwd2 )
{ // Contraseñas distintas
  $RESPONSE_CODE    = 422; // UNPROCESSABLE ENTITY
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Contraseñas distintas';
}
else if( $login == '' )
{
  $RESPONSE_CODE    = 422;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Login no válido';
}
else
{
  try{
    // ******** INICIO DE TRANSACCION **********
    $dbCon->beginTransaction();
    if(!comprobarExistencia($login, $db))
    { // El usuario no existe, se da de alta
      if($_FILES['foto']['error'] != UPLOAD_ERR_NO_FILE)
      { // Hay que comprobar si el fichero pesa menos de lo permitido
        if( $_FILES['foto']['size'] < $TAM_MAX_ARCHIVO ){
          // Hay que sacar la extensión
          $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION); // extensión del fichero
          $VPARAMS[':FOTO'] = $login . '.' . $ext;
        }
        else
        { // El fichero pesa demasiado
          $VPARAMS[':FOTO'] = '';
          $R['FOTO']        = '';
          $R['ERROR_FOTO']  = 'No se ha subido la foto. Su tamaño excede el permitido (' . $TAM_MAX_ARCHIVO / 1024 . ' KB)';
        }
      }
      else
      { // El archivo de foto viene vacío
        $VPARAMS[':FOTO'] = '';
      }
      $mysql  = 'insert into usuario(login,pwd,nombre,email,foto) values(:LOGIN,:PWD,:NOMBRE,:EMAIL,:FOTO)';
      $VPARAMS[':LOGIN']  = $login;
      $VPARAMS[':PWD']    = $pwd;
      $VPARAMS[':NOMBRE'] = $nombre;
      $VPARAMS[':EMAIL']  = $email;

      if( $db->executeStatement($mysql, $VPARAMS) )
      {
        $RESPONSE_CODE    = 201; // RESOURCE CREATED INSIDE A COLLECTION
        $R['RESULTADO']   = 'OK';
        $R['CODIGO']      = $RESPONSE_CODE;
        $R['DESCRIPCION'] = 'Usuario creado correctamente';
        $R['LOGIN']       = $login;

        if($VPARAMS[':FOTO'] != '')
        {
          $uploadfile = '../../../' . PATH_FOTOS . 'usuarios/'. $VPARAMS[':FOTO']; // path fichero destino
          $upload_dir = '../../../' . PATH_FOTOS . 'usuarios/';
          // Se comprueba si la carpeta existe y tiene permisos de escritura
          if (is_dir($upload_dir) && is_writable($upload_dir))
          {
            if(move_uploaded_file($_FILES['foto']['tmp_name'], $uploadfile)) // se sube el fichero
              $R['FOTO'] = $VPARAMS[':FOTO'];
          } else {
            $R['ERROR_FOTO'] = 'No se ha podido subir la foto. Comprueba que la correspondiente carpeta del servidor tenga permisos de escritura.';
            $R['FOTO'] = '';
          }
        }
      }
      else
      {
        echo "\nholaalala\n";
        $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
        $R['RESULTADO']   = 'ERROR';
        $R['CODIGO']      = $RESPONSE_CODE;
        $R['DESCRIPCION'] = 'Error indefinido al crear el nuevo registro';
      }
    } // if(!comprobarExistencia($login))
    else
    { // El usuario existe
      $RESPONSE_CODE    = 409; // CONFLICT
      $R['RESULTADO']   = 'ERROR';
      $R['CODIGO']      = $RESPONSE_CODE;
      $R['DESCRIPCION'] = 'Login no válido, ya está en uso.';
    }
    // ******** FIN DE TRANSACCION **********
    $dbCon->commit();
  } catch(Exception $e){
    // Se ha producido un error, se cancela la transacción.
    $dbCon->rollBack();
  }
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
print json_encode($R);
?>