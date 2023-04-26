'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    let zonas = await getZonas();

    let datalist = document.querySelector('datalist');
    (zonas.FILAS).forEach(zona => {
        datalist.innerHTML += `<option value="${zona.nombre}">`;
    });
});