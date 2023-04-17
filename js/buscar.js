'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    //OBTENER URL Y OBTENER LOS ARGUMENTOS SI LOS HUBIERA
    const valores = location.search;
    const urlParams = new URLSearchParams(valores);
    console.log(urlParams);
    if (urlParams.size > 0) {
        const zona = urlParams.get('zona');

        if (zona) {
            //RELLENAR EL CAMPO DEL FORMULARIO CON LA ZONA
            const inputZona = document.querySelector('input[name="zona"]');
            inputZona.value = zona;

            //HACER PETICION DE BUSQUEDA CON EL PARAMETRO
            const publicaciones = await getPublicacionesFiltro({ zona: zona });
            console.log(publicaciones);
            creaPublicaciones(publicaciones);
        }
    }
});