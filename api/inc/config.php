<?php
// ============================================================
// PARAMETROS GENERALES DE CONFIGURACION PARA EL SERVIDOR
// ============================================================
// CONSTANTES DE TEXTO. SE PUEDEN DECLARAR CON define().
define("PATH_FOTOS", "fotos/");   // Path relativo hasta la carpeta de fotos, desde la raíz de la web (en este caso, htdocs/pcw/)
define("_REC_", "_rec_"); // nombre del parámetro en la petición que trae la parte de recurso de la URL
// LAS CONSTANTES NUMÉRICAS NO SE PUEDEN DECLARAR CON define().
$TAM_MAX_ARCHIVO = 300 * 1024; // Máximo peso permitido para las fotos en Bytes (300KB).

/**
 * ============================================================
 * FUNCIONES AUXILIARES
 * ============================================================
 */

// =================================================================================
// Analiza el parámetro $_SERVER["QUERY_STRING"] y devuelve la parte de recurso y la de
// los parámetros de la petición ($_GET)
// =================================================================================
function analizarPeticion($queryString, &$recurso, &$params){
    parse_str($_SERVER["QUERY_STRING"], $prms);

    $recurso = $prms[_REC_];
    unset($prms[_REC_]);
    $params = $prms;
}

// =================================================================================
// Sanatiza lo textos
// =================================================================================
function sanatize($valor)
{
    return urldecode('' . $valor);
}
?>