 <?php
// FICHERO: api/get/zonas.php
// =================================================================================
// PETICIONES GET ADMITIDAS:
// =================================================================================
//   api/etiquetas  -------------------> devuelve todas las etiquetas
// =================================================================================
// INCLUSIÓN DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../inc/config.php'); // Constantes, etc ...
require_once('../inc/database.php');

// =================================================================================
// Se instancia la BD y se pilla la conexión
// =================================================================================
$db    = new Database(); // Base de datos
$dbCon = $db->getConnection(); // Conexión a la base de datos
// =================================================================================
// CONFIGURACIÓN DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// SE ANALIZA LA PETICIÓN Y SE SEPARA RECURSO Y PARÁMETROS DE LA PETICIÓN
// =================================================================================
analizarPeticion($_SERVER['QUERY_STRING'], $RECURSO, $PARAMS);
// =================================================================================
// SE PREPARA LA RESPUESTA
// =================================================================================
$R             = [];  // Almacenará el resultado.
$RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
// sql base de la consulta
$mysql = 'select nombre from zona where true';
// Se construye la cláusula where
$whereClause = ''; // Cláusula where en sql con parámetros
$prms = []; // array de parámetros para la consulta preparada
// Se recorren todos los parámetros que vengan en la petición y sólo se usan
// aquéllos que se reconocen.
foreach ($PARAMS as $key => $value) {
    switch($key){
        case 'nombre':
                $whereClause = " and nombre like CONCAT('%',:NOMBRE,'%')";
                $prms[":NOMBRE"] = $value;
            break;
    }
}
$mysql .= $whereClause . ' order by nombre'; // orden de los resultados
// Se hace la petición con el sql preparado completo y sus parámetros, y se obtiene el resultado
$RESPUESTA = $db->select($mysql, $prms);
// if($result) // execute query OK
if( $RESPUESTA['CORRECTO'] ) // execute query OK
{
    $RESPONSE_CODE  = 200;
    $R['RESULTADO'] = 'OK';
    $R['FILAS']     = $RESPUESTA['RESULT'];
}
else
{
    $RESPONSE_CODE    = 500;
    $R['RESULTADO']   = 'ERROR' ;
    $R['DESCRIPCION'] = 'Se ha producido un error en el servidor al ejecutar la consulta.';
    $R['ERROR']       = $RESULTADO['ERROR'];
}
$R = ['CODIGO'=>$RESPONSE_CODE] + $R;
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
