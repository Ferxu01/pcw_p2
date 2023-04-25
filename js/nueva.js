'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    let zonas = await getZonas();
    console.log(zonas);

    let datalist = document.querySelector('datalist');
    (zonas.FILAS).forEach(zona => {
        console.log(zona);
        datalist.innerHTML += `<option value="${zona.nombre}">`;
    });
});