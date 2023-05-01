'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    let zonas = await getZonas();

    let datalist = document.querySelector('datalist');
    (zonas.FILAS).forEach(zona => {
        datalist.innerHTML += `<option value="${zona.nombre}">`;
    });

    const checkForm = document.getElementById("nuevo"),
        submitBtn = document.getElementById("submit");

    submitBtn.disabled = true;

    checkForm.addEventListener("change", () => {
        let imgInput = document.getElementsByClassName("img")[0];
        if (imgInput !== null && imgInput !== undefined) {
            if (imgInput.src === "http://localhost/pcw/practica2/images/no_foto.jpg") {
                submitBtn.disabled = true;
                crearModalNoFoto();
            } else {
                submitBtn.disabled = false;
            }
        }

    })
});