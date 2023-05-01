'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const publicaciones = await getPublicacionesFiltro({ registrosPorPagina: 6, pagina: 0 }); //LA PAGINA 0 ES LA PRIMERA PAGINA

    creaPublicaciones(publicaciones);

    const botonesPaginacion = document.getElementsByTagName('button');
    let pagActual = document.getElementsByClassName('pagActual')[0];
    let totalPags = document.getElementsByClassName('totalPags')[0];
    pagActual.textContent = 1; //AL INICIAR LA PAGINA SIEMPRE EMPIEZA POR LA PRIMERA PAGINA
    totalPags.textContent = Math.ceil(publicaciones.TOTAL_COINCIDENCIAS/publicaciones.LPAG); //REDONDEA HACIA ARRIBA PARA OBTENER LAS PAGINAS TOTALES

    if (parseInt(pagActual.textContent) === 1 && parseInt(totalPags.textContent) === 1) {
        botonesPaginacion[0].removeAttribute('onclick');
        botonesPaginacion[1].removeAttribute('onclick');
        botonesPaginacion[2].removeAttribute('onclick');
        botonesPaginacion[3].removeAttribute('onclick');
    } else {
        //DESHABILITAR BOTONES DE PAGINA ANTERIOR AL SER LA PRIMERA PAGINA MOSTRADA
        const btnPrimeraPag = botonesPaginacion[0];
        const btnPagAnterior = botonesPaginacion[1];

        //SE EVITA QUE SE EJECUTE LA FUNCION PARA EVITAR TRAFICO
        btnPrimeraPag.removeAttribute('onclick');
        btnPagAnterior.removeAttribute('onclick');
    }
});