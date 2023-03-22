 <?php
 // FICHERO: api/get/publicaciones.php
// =================================================================================
// PETICIONES GET ADMITIDAS:
// =================================================================================
//   api/publicaciones  --------------------> devuelve todos los registros
//   api/publicaciones/{ID} ----------------> devuelve toda la información del registros con el ID que se le pasa
//   api/publicaciones/{ID}/fotos ----------> devuelve todas las fotos del registro con el ID que se le pasa
//   api/publicaciones/{ID}/comentarios ----> devuelve todos los comentarios del registro con el ID que se le pasa
// ---------------------------------------------------------------------------------
// PARÁMETROS PARA LA BÚSQUEDA. DEVUELVE LOS REGISTROS QUE CUMPLAN TODOS LOS CRITERIOS DE BÚSQUEDA.
// SE PUEDEN COMBINAR TODOS LOS PARÁMETROS QUE SE QUIERA EN LA MISMA URL MEDIANTE EL OPERADOR &.
// EN LA CONSULTA EN LA BD SE UTILIZARÁ EL OPERADOR AND PARA COMBINAR TODOS LOS CRITERIOS ESPECIFICADOS.
//   api/publicaciones?t={texto} -> busca el texto indicado en el campo titulo o en el campo texto de la publicación. Devuelve la lista de registros que contengan en el título o en el texto, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}. Por ejemplo: api/publicacioens?n=calle,suciedad
//   api/publicaciones?z={texto} -> busca el texto indicado en zona de la publicación. Devuelve la lista de registros cuya zona contenga, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}. Por ejemplo: api/publicaciones?z=Nazaret,Norte
//   api/publicaciones?fd={fecha desde} -> búsqueda por fecha de publicación. La fecha se indica con el siguiente formato: aaaa-mm-dd. Por ejemplo: api/publicaciones?fd=2023-01-19
//   api/publicaciones?fh={fecha hasta} -> búsqueda por fecha de publicación. La fecha se indica con el siguiente formato: aaaa-mm-dd. Por ejemplo: api/publicaciones?fh=2023-01-20
// ---------------------------------------------------------------------------------
// PAGINACIÓN
//	 api/publicaciones?pag={página}&lpag={número de registros por página} -> devuelve los registros que están en la página que se le pide, tomando como tamaño de página el valor de lpag. Por ejemplo: api/publicaciones?t=Nazaret,Norte&pag=3&lpag=10
// =================================================================================
// INCLUSIÓN DEL FICHERO DE CONFIGURACIÓN Y DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../inc/config.php'); // Constantes, etc ...
require_once('../inc/database.php');
// =================================================================================
// SE OBTIENE LA CONEXIÓN A AL BD
// =================================================================================
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// RECURSO QUE VIENE EN LA PETICIÓN HTTP
// =================================================================================
if(strlen($_GET[_REC_]) > 0)
    $RECURSO = explode("/", substr($_GET[_REC_],1));
else
    $RECURSO = [];
// Se pillan los parámetros de la petición
$PARAMS = array_slice($_GET, 1, count($_GET) - 1,true);

// =================================================================================
// =================================================================================
// FUNCIONES AUXILIARES
// =================================================================================
// =================================================================================

// =================================================================================
// Añade las condiciones de filtro (búsqueda)
// =================================================================================
// $valores -> Guardará los valores de los parámetros, ya que la consulta es preparada
// $params  -> Trae los parámetros de la petición
function aplicarFiltro(&$valores, $params)
{
    $filtroSQL = '';

    // BÚSQUEDA POR TEXTO
    if( isset($params['t']) ) // búsqueda
    {
        if($filtroSQL != '') $filtroSQL .= ' and';
        $filtroSQL .= ' (false';

        $texto = explode(',', $params['t']);
        $paraTexto = '';
        foreach ($texto as $idx=>$valor) {
            $paraTexto .= ' or p.titulo like :TITULO' . $idx . ' or p.texto like :TEXTO' . $idx;
            $valores[':TITULO' . $idx] = '%' . trim($valor) . '%';
            $valores[':TEXTO' . $idx] = '%' . trim($valor) . '%';
        }
        $filtroSQL .= $paraTexto . ')';
    }
    // BÚSQUEDA POR ZONA
    if( isset($params['z']) ) // búsqueda
    {
        if($filtroSQL != '') $filtroSQL .= ' and';
        $filtroSQL .= ' (false';

        $texto = explode(',', $params['z']);
        $paraZona = '';
        foreach ($texto as $idx=>$valor) {
            $paraZona .= ' or z.nombre like :ZONA' . $idx;
            $valores[':ZONA' . $idx] = '%' . trim($valor) . '%';
        }
        $filtroSQL .= $paraZona . ')';
    }
    // BÚSQUEDA POR FECHA
    if( isset($params['fd']) || isset($params['fh']) )
    {
        // * DESDE
        if( isset($params['fd']) )
        {
        if($filtroSQL != '') $filtroSQL .= ' and';
            // $filtroSQL .= ' and ';
            $filtroSQL .= ' DATE_FORMAT(fechaHora,"%Y-%m-%d")>=:FECHA_DESDE';
            $valores[':FECHA_DESDE'] = $params['fd'];
        }
        // * HASTA
        if( isset($params['fh']) )
        {
        if($filtroSQL != '') $filtroSQL .= ' and';
            // $filtroSQL .= ' and ';
            $filtroSQL .= ' DATE_FORMAT(fechaHora,"%Y-%m-%d")<=:FECHA_HASTA';
            $valores[':FECHA_HASTA'] = $params['fh'];
        }
    }

    return $filtroSQL;
}
// =================================================================================
// =================================================================================
// FIN DE FUNCIONES AUXILIARES
// =================================================================================
// =================================================================================

// =================================================================================
// CONFIGURACIÓN DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// SE PREPARA LA RESPUESTA
// =================================================================================
$R                   = [];  // Almacenará el resultado.
$RESPONSE_CODE       = 200; // código de respuesta por defecto: 200 - OK
$mysql               = '';  // para el SQL
$VALORES             = [];  // Son los valores para hacer la consulta
$TOTAL_COINCIDENCIAS = -1;  // Total de coincidencias en la BD
// =================================================================================
// SE COGE EL ID DEL REGISTRO, SI EXISTE
// =================================================================================
$ID = array_shift($RECURSO); // Se comprueba si se proporciona el id del registro
// =================================================================================
// SQL POR DEFECTO PARA SELECCIONAR TODOS LOS REGISTROS
// =================================================================================
$mysql  = 'select p.id, p.titulo, DATE_FORMAT(p.fechaHora,"%Y-%m-%d") as fechaCreacion, p.autor, ';
$mysql .= 'z.id as idZona, z.nombre as nombreZona,';
if(is_numeric($ID)){
    $mysql .= 'p.texto,';
    $mysql .= '(select count(*) from megusta m where m.idPublicacion=p.id and m.valor=TRUE) as nMeGusta,';
    $mysql .= '(select count(*) from megusta m where m.idPublicacion=p.id and m.valor=FALSE) as nNoMeGusta,';

    // =================================================================================
    // Se pillan las cabeceras de la petición y se comprueba que está la de autorización
    // =================================================================================
    $headers = apache_request_headers();
    // CABECERA DE AUTORIZACIÓN
    if(isset($headers['Authorization']))
        $AUTORIZACION = $headers['Authorization'];
    elseif (isset($headers['authorization']))
        $AUTORIZACION = $headers['authorization'];

    if(isset($AUTORIZACION))
    {
        list($login,$token) = explode(':', $AUTORIZACION);
        if( $db->comprobarSesion($login,$token) ){
           $mysql .= 'coalesce((select valor from megusta m where m.idPublicacion=p.id and m.usuario=:LOGIN),-1) as meGusta,';
            $VALORES[':LOGIN'] = $login;
        }
    }
}
else
    $mysql .= '(select archivo from foto f where f.idPublicacion=p.id order by id limit 1) as imagen,';
$mysql .= '(select foto from usuario u where u.login=p.autor) as fotoAutor';
// =================================================================================
// SE SIGUE CON EL SQL ...
// =================================================================================
$mysql .= ' FROM publicacion p, zona z where p.idZona=z.id';
// =================================================================================
// PRIMER NIVEL DE DECISIÓN: SE PIDEN DATOS DE UN REGISTRO CONCRETO O DE TODOS?
// =================================================================================
if(is_numeric($ID)) // Se debe devolver toda la información del registro con el id indicado
{ // INFORMACIÓN RELACIONADA CON UN REGISTRO CONCRETO
    switch (array_shift($RECURSO))
    {
        case 'comentarios': // SE PIDEN LOS COMENTARIOS DEL REGISTRO
                $mysql   = 'select u.login,u.nombre,u.foto,c.texto,c.fechaHora from comentario c, usuario u where c.idPublicacion=:ID_PUB and c.usuario=u.login order by fechaHora desc';
                $VALORES = [];
            break;
        case 'fotos': // SE PIDEN LAS FOTOS ASOCIADAS AL REGISTRO INDICADO
                $mysql   = 'select * from foto where idPublicacion=:ID_PUB';
                $VALORES = [];
            break;
        default: // SE PIDE TODA LA INFORMACIÓN DE UN REGISTRO CONCRETO
                $mysql .= ' and p.id=:ID_PUB';
                $info_completa = true; // Hay que devolver toda la información



            break;
    }
    $VALORES[':ID_PUB'] = $ID;
}
else if( count($PARAMS) > 0 )
{ // INFORMACIÓN RELACIONADA CON TODOS LOS REGISTROS
    // =================================================================================
    // SE AÑADE EL FILTRO EN FUNCIÓN DE LOS PARÁMETROS
    // =================================================================================
    $filtroSQL = aplicarFiltro($VALORES, $PARAMS);
    if($filtroSQL != ''){
        if(substr($filtroSQL,0, strlen(' having ')) == ' having ')
            $mysql .= $filtroSQL;
        else
            $mysql .= ' and' . $filtroSQL;
    }
    // =================================================================================
    // SE AÑADE EL ORDEN DE BÚSQUEDA
    // =================================================================================
    $mysql .= ' order by p.fechaHora desc';
}
// =================================================================================
// SE CONSTRUYE LA PARTE DEL SQL PARA PAGINACIÓN
// =================================================================================
if(isset($PARAMS['pag']) && is_numeric($PARAMS['pag'])      // Página a listar
    && isset($PARAMS['lpag']) && is_numeric($PARAMS['lpag']))   // Tamaño de la página
{
    $pagina           = $PARAMS['pag'];
    $regsPorPagina    = $PARAMS['lpag'];
    $ELEMENTO_INICIAL = $pagina * $regsPorPagina;
    $SQL_PAGINACION   = ' LIMIT ' . $ELEMENTO_INICIAL . ',' . $regsPorPagina;
    // =================================================================================
    // Para sacar el total de coincidencias que hay en la BD:
    // =================================================================================
    $RESPUESTA = $db->select($mysql, $VALORES);
    if($RESPUESTA['CORRECTO'])
    {
        $TOTAL_COINCIDENCIAS = count($RESPUESTA['RESULT']);
        $R['TOTAL_COINCIDENCIAS'] = count($RESPUESTA['RESULT']);
        $R['PAG']  = $PARAMS['pag'];
        $R['LPAG'] = $PARAMS['lpag'];
    }

    $mysql .= $SQL_PAGINACION;
}
// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
// Se hace la petición con el sql preparado completo y sus parámetros, y se obtiene el resultado
$RESPUESTA = $db->select($mysql, $VALORES);
if( $RESPUESTA['CORRECTO'] ) // execute query OK
{
    $RESPONSE_CODE  = 200;
    $R = ['RESULTADO' => 'OK'] + $R;
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
