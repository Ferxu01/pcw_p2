<?php
// FICHERO: api/post/publicaciones.php
// PETICIONES POST ADMITIDAS:
// Nota: Todas las operaciones deberán añadir a la petición POST una cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
// * api/publicaciones -> Dar de alta un nuevo registro
//       Params: titulo:Título de la publicación; texto:Texto de la publicación;zona:zona a la que está asociada;
//               fotos[]:array de fotos. Cada elemento del array es un input de tipo file
//               descripciones[]:array de descripciones de las fotos.
// * api/publicaciones/{ID}/comentarios -> Da de alta un comentario para el registro asociado.
//       Params: texto:texto del comentario
// * api/publicaciones/{ID}/megusta -> Guarda un voto "Me gusta" por parte del usuario
//       Params: ninguno
// * api/publicaciones/{ID}/nomegusta -> Guarda un voto "No me gusta" por parte del usuario
//       Params: ninguno
// =================================================================================
// INCLUSIÓN DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../inc/config.php'); // Constantes, etc ...
require_once('../inc/database.php');
// =================================================================================
// Se instancia la base de datos y el objeto producto
// =================================================================================
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// La instrucción siguiente es para poder recoger tanto errores como warnings que
// se produzcan en las operaciones sobre la BD (funciondes php errorCode() y errorInfo())
// =================================================================================
$dbCon->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );
// =================================================================================
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se toman la parte de la url que viene a partir de publicaciones
// =================================================================================
$RECURSO = explode("/", substr($_GET['prm'],1));
// =================================================================================
// =================================================================================
// FUNCIONES AUXILIARES
// =================================================================================
// =================================================================================
/**
 * Copia el archivo indicado al servidor e inserta el correspondiente registro en la BD.
 * @param integer $ID - ID del lugar al que pertenece la foto
 * @param $_FILES['fotos'] $FICHEROS - Array de ficheros de la petición POST de php
 * @param texto[] $DESCRIPCIONES - Descripciones de las fotos
 * @param integer $NFOTO - Índice del fichero de foto de $_FILES a subir
 * @return integer - Retorna 0 si todo fue bien. Retorna -1 si hubo algún error al intentar guardar la foto en la BD. Retorna -2 si no se pudo guardar en disco. Retorna 2 si el tamaño del fichero es mayor al permitido.
*/
function subirFoto($ID, $FICHEROS, $DESCRIPCION, $NFOTO)
{
  global $db, $TAM_MAX_ARCHIVO;

  $valor_retorno = -1;

  if($FICHEROS['size'][$NFOTO] <= $TAM_MAX_ARCHIVO)
  {
    $mysql = 'insert into foto(descripcion,idPublicacion, archivo) values(:DESCRIPCION,:ID_PUB,:ARCHIVO);';

    $VALORES                 = [];
    $VALORES[':DESCRIPCION'] = $DESCRIPCION;
    $VALORES[':ID_PUB']      = $ID;
    $VALORES[':ARCHIVO']     = ''; // nombre por defecto del archivo. Luego se cambia.

    if( $db->executeStatement($mysql, $VALORES) )
    {
      $mysql = 'select max(ID) as id_fichero from foto';
      $RESPUESTA = $db->select($mysql);
      if( $RESPUESTA['CORRECTO'] )
      {
        $row = $RESPUESTA['RESULT'][0];
        $ID_FICHERO = $row['id_fichero'];

        $ext = pathinfo($FICHEROS['name'][$NFOTO], PATHINFO_EXTENSION); // extensión del fichero
        $NOMBRE_FICHERO = 'foto' . $ID_FICHERO . '.' . $ext;
        $upload_dir     = '../../' . PATH_FOTOS . 'pubs/';
        $uploadfile     = $upload_dir . $NOMBRE_FICHERO; // path fichero destino

        // Se comprueba si la carpeta existe y tiene permisos de escritura
        if (is_dir($upload_dir) && is_writable($upload_dir))
        {
          if(move_uploaded_file($FICHEROS['tmp_name'][$NFOTO], $uploadfile)) // se sube el fichero
          {
            $mysql = 'update foto set archivo=:FICHERO where id=:ID_FICHERO';
            $VALORES                = [];
            $VALORES[':FICHERO']    = $NOMBRE_FICHERO;
            $VALORES[':ID_FICHERO'] = $ID_FICHERO;

            $valor_retorno = 0; // Se guardó bien la foto
          }
          else
          { // No se ha podido copiar la foto. Hay que eliminar el registro
            $mysql = 'delete from foto where id=:ID_FICHERO';
            $VALORES[':ID_FICHERO'] = $ID_FICHERO;
            $valor_retorno = -2;
          }
          // SE EJECUTA LA CONSULTA
          $db->executeStatement($mysql, $VALORES);
        }
        else{
          $valor_retorno = -3; // No existe el directorio o no tiene permisos de escritura
        }
      }
    }
  }
  else
  { // Archivo demasiado grande
    $valor_retorno = 2;
  }

  return $valor_retorno;
}
// =================================================================================
// Se pillan las cabeceras de la petición y se comprueba que está la de autorización
// =================================================================================
$headers = apache_request_headers();
// CABECERA DE AUTORIZACIÓN
if(isset($headers['Authorization']))
    $AUTORIZACION = $headers['Authorization'];
elseif (isset($headers['authorization']))
    $AUTORIZACION = $headers['authorization'];

if(!isset($AUTORIZACION))
{ // Acceso no autorizado
  $RESPONSE_CODE    = 403;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Falta autorización';
}
else
{
  // =================================================================================
  // Se prepara la respuesta
  // =================================================================================
  $R             = [];  // Almacenará el resultado.
  $RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
  // =================================================================================
  // =================================================================================
  // Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos
  // de la nueva entrada, NO LAS FOTOS. Las fotos se suben por separado una vez se haya
  // confirmado la creación correcta de la entrada.
  $PARAMS = $_POST;
  list($login,$token) = explode(':', $AUTORIZACION);

  if( !$db->comprobarSesion($login,$token) )
  {
    $RESPONSE_CODE    = 401;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Error de autenticación.';
  }
  else
  {
    $ID = array_shift($RECURSO);
    try{
      $dbCon->beginTransaction();
      if(!is_numeric($ID)) // NUEVO REGISTRO
      { // Si no es numérico $ID es porque se está creando un nuevo registro
        $titulo        = $PARAMS['titulo'];
        $texto         = nl2br($PARAMS['texto'],false);
        $zona          = $PARAMS['zona'];
        $descripciones = $PARAMS['descripciones'];
        // ==================================================
        // Hay que buscar la zona en la BD. Si existe se utiliza su id.
        // Si no existe, se crea.
        // ==================================================
        $mysql = 'select * from zona where nombre=:ZONA';
        $RESPUESTA = $db->select($mysql, [':ZONA'=>$zona]);

        if( $RESPUESTA['CORRECTO'] ) // execute query OK
        {
          if(count($RESPUESTA['RESULT']) > 0)
          { // encontrado
            $idZona = $RESPUESTA['RESULT'][0]['id'];
          }
          else
          { // No existe la zona. Hay que crearla.
            $mysql = 'insert into zona(nombre) values(:NOMBRE)';
            if( $db->executeStatement($mysql, [':NOMBRE'=>$zona]) )
            {
              $mysql = 'select max(id) as idZona from zona';
              $RESPUESTA = $db->select($mysql);
              if( $RESPUESTA['CORRECTO'] ) // execute query OK
              {
                if(count($RESPUESTA['RESULT']) > 0)
                { // encontrado
                  $idZona = $RESPUESTA['RESULT'][0]['idZona'];
                }
              }
            }
          }
        }

        // =================================================================================
        $mysql  = 'insert into publicacion(titulo,texto,idZona,autor) ';
        $mysql .= 'values(:TITULO,:TEXTO,:ID_ZONA,:AUTOR)';
        $VALORES             = [];
        $VALORES[':TITULO']  = $titulo;
        $VALORES[':TEXTO']   = $texto;
        $VALORES[':ID_ZONA'] = $idZona;
        $VALORES[':AUTOR']   = $login;

        if( $db->executeStatement($mysql, $VALORES) )
        {
          $mysql = "select MAX(id) as id_pub from publicacion";
          $RESPUESTA = $db->select($mysql);
          if($RESPUESTA['CORRECTO'])
          {
            $ID = $RESPUESTA['RESULT'][0]['id_pub'];
            // ===============================
            // Si hay fotos, hay que guardarlas
            // ===============================
            $fotos = [];

            if($_FILES['fotos']['error'][0] != UPLOAD_ERR_NO_FILE)
            { // Hay ficheros que guardar
              for($i=0;$i<count($_FILES['fotos']['name']);$i++)
              {
                $val_ret = subirFoto($ID, $_FILES['fotos'], $descripciones[$i], $i);
                $fotoSubida             = [];
                $fotoSubida['NOMBRE']   = $_FILES['fotos']['name'][$i];
                $fotoSubida['GUARDADA'] = ($val_ret == 0)?'SI':'NO';
                if($val_ret !=0)
                {
                  switch($val_ret)
                  {
                    case -1: // Error al intentar guardar la foto en la BD
                        $fotoSubida['ERROR'] = 'No se ha podido guardar la foto en la BD. Error del servidor o la BD no está creada.';
                      break;
                    case -2: // Error al intentar guardar la foto en disco
                        $fotoSubida['ERROR'] = 'No se ha podido copiar la foto a la carpeta de fotos.';
                      break;
                    case -3: // La carpeta de fotos no existe o no tiene permisos de escritura
                        $fotoSubida['ERROR'] = 'No se ha podido copiar la foto a la carpeta de fotos. Puede ser que la carpeta de fotos no exista o no tenga permisos de escritura.';
                      break;
                    case 2: // No se guarda la foto porque pesa más de lo permitido
                        $fotoSubida['ERROR'] = 'No se ha podido guardar la foto porque pesa más de lo permitido (' . ($max_uploaded_file_size/1024) . 'KB)';
                      break;
                  }
                }
                array_push($fotos, $fotoSubida);
              }
            }

            // Se prepara la respuesta
            $RESPONSE_CODE    = 201;
            $R['RESULTADO']   = 'OK';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Registro creado correctamente';
            $R['ID']          = $ID;
            $R['TITULO']      = $titulo;
            $R['FOTOS']       = $fotos;

          }
          else
            $ID = -1;
        }
        else
        {
          $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
          $R['RESULTADO']   = 'ERROR';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Error indefinido al crear el nuevo registro';
        }
      }
      else // El registro ya existe y se quiere realizar alguna operación sobre él
      {
        $VALORES            = [];
        $VALORES[':ID_PUB'] = $ID;
        $VALORES[':LOGIN']  = $login;
        $rec = array_shift($RECURSO);
        switch( $rec ){
          case 'comentarios': // Dejar comentario de una publicación
              $VALORES[':TEXTO']  = nl2br($PARAMS['texto'],false);
              $mysql  = 'insert into comentario(texto, usuario, idPublicacion) ';
              $mysql .= 'values(:TEXTO, :LOGIN, :ID_PUB)';
              $mensaje = 'Guardar comentario.';
              if($db->executeStatement($mysql, $VALORES)){
                $RESPONSE_CODE    = 201;
                $R['RESULTADO']   = 'OK';
                $R['CODIGO']      = $RESPONSE_CODE;
                $R['DESCRIPCION'] = $mensaje . ' Operación realizada correctamente.';
              }
              else
              {
                $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
                $R['RESULTADO']   = 'ERROR';
                $R['CODIGO']      = $RESPONSE_CODE;
                $R['DESCRIPCION'] = $mensaje . ' Error indefinido al realizar la operación';
              }
            break;
          case 'megusta':
          case 'nomegusta':
              $mysql = 'select * from megusta where idPublicacion=:ID_PUB and usuario=:LOGIN';
              $RESPUESTA = $db->select($mysql, $VALORES);
              if($RESPUESTA['CORRECTO']){
                if(count($RESPUESTA['RESULT']) > 0){
                  $mysql = 'delete from megusta where idPublicacion=:ID_PUB and usuario=:LOGIN';
                  $mensaje = 'Eliminar votación.';
                  $rec = -1;
                }
                else{
                  $mysql = 'insert into megusta(idPublicacion,valor,usuario) values(:ID_PUB,:VALOR,:LOGIN)';
                  $VALORES[':VALOR'] = ($rec=='megusta'?1:0);
                  $mensaje = ' Realizar votación.';
                }
                // Se realiza la operación
                if($db->executeStatement($mysql, $VALORES)){
                  $RESPONSE_CODE    = 201;
                  $R['RESULTADO']   = 'OK';
                  $R['CODIGO']      = $RESPONSE_CODE;
                  $R['DESCRIPCION'] = $mensaje . ' Operación realizada correctamente.';
                }
                else
                {
                  $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
                  $R['RESULTADO']   = 'ERROR';
                  $R['CODIGO']      = $RESPONSE_CODE;
                  $R['DESCRIPCION'] = $mensaje . ' Error indefinido al realizar la operación';
                }
                // Se consulta y devuelven cómo ha quedado la votación tras la operación
                $mysql  = ' select p.id, "' . $login . '" as usuario,';
                $mysql .= '(select count(*) from megusta m where m.idPublicacion=p.id and m.valor=TRUE) as nMeGusta,';
                $mysql .= '(select count(*) from megusta m where m.idPublicacion=p.id and m.valor=FALSE) as nNoMeGusta';
                $mysql .= ' from publicacion p where p.id=:ID_PUB';

                $RESPUESTA = $db->select($mysql, [':ID_PUB'=>$ID]);
                if($RESPUESTA['CORRECTO']){
                  $pub = $RESPUESTA['RESULT'][0];
                  $R['idPublicacion'] = $ID;
                  $R['login']         = $login;
                  $R['nMeGusta']      = $pub['nMeGusta'];
                  $R['nNoMeGusta']    = $pub['nNoMeGusta'];
                  $R['meGusta']       = ($rec == -1?-1:($rec=='megusta'?1:0));
                }
              }
            break;
        }
      } // else // El registro ya existe y se quiere realizar alguna operación sobre él

      $dbCon->commit();
    }catch(Exception $e){
      echo $e;
      $dbCon->rollBack();
    }
  } // if( !comprobarSesion($login,$clave) )
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
echo json_encode($R);
?>