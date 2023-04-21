'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    //OBTENER URL Y OBTENER LOS ARGUMENTOS SI LOS HUBIERA
    const valores = location.search;
    const urlParams = new URLSearchParams(valores);
    console.log(urlParams);

    if (urlParams.size > 0) {
        const zona = urlParams.get('z');
        let pagina = parseInt(urlParams.get('pag'))-1 || undefined;
        const regPorPagina = parseInt(urlParams.get('lpag')) || undefined;

        if (zona) {
            //RELLENAR EL CAMPO DEL FORMULARIO CON LA ZONA
            const inputZona = document.querySelector('input[name="zona"]');
            inputZona.value = zona;

            //HACER PETICION DE BUSQUEDA CON EL PARAMETRO
            const publicaciones = await getPublicacionesFiltro({ zona: zona, registrosPorPagina: regPorPagina || 6, pagina: pagina || 0 });
            
            creaPublicaciones(publicaciones);

            //DESHABILITAR BOTONES DE PAGINA ANTERIOR AL SER LA PRIMERA PAGINA MOSTRADA
            let pagActual = document.getElementsByClassName('pagActual')[0];
            let totalPags = document.getElementsByClassName('totalPags')[0];
            pagActual.textContent = ++publicaciones.PAG;
            totalPags.textContent = Math.ceil(publicaciones.TOTAL_COINCIDENCIAS/publicaciones.LPAG); //REDONDEA HACIA ARRIBA PARA OBTENER LAS PAGINAS TOTALES

            const botonesPaginacion = document.getElementsByTagName('button');
            if (parseInt(pagActual.textContent) === 1 && parseInt(totalPags.textContent) === 1) {
                botonesPaginacion[0].removeAttribute('onclick');
                botonesPaginacion[1].removeAttribute('onclick');
                botonesPaginacion[2].removeAttribute('onclick');
                botonesPaginacion[3].removeAttribute('onclick');

            } else {
                //COMPROBAR LA PAGINA QUE SE MUESTRA PARA MODIFICAR LOS BOTONES DE LA PAGINACION
                if (parseInt(pagActual.textContent) === parseInt(totalPags.textContent)) {
                    botonesPaginacion[0].setAttribute('onclick', 'actualizaPaginacion(event)');
                    botonesPaginacion[1].setAttribute('onclick', 'actualizaPaginacion(event)');

                    //DESHABILITAR BOTONES SIGUIENTE Y ULTIMA PAGINA
                    botonesPaginacion[2].removeAttribute('onclick');
                    botonesPaginacion[3].removeAttribute('onclick');

                } else if (parseInt(pagActual.textContent) === 1) {
                    botonesPaginacion[0].removeAttribute('onclick');
                    botonesPaginacion[1].removeAttribute('onclick');

                    botonesPaginacion[2].setAttribute('onclick', 'actualizaPaginacion(event)');
                    botonesPaginacion[3].setAttribute('onclick', 'actualizaPaginacion(event)');
                }
            }
        }
    }
});