let registro = getUserData() || undefined;

async function checkLogin() {
    const loginInput = document.getElementById('login'),
        loginMsg = document.getElementById('msgLogin'),
        submitBtn = document.getElementById("submit");
    let loginDisponible = null;
    if (loginInput.value !== "") {
        loginDisponible = getDisponibilidadLogin(loginInput.value)
            .then((loginDisponible) => {
                if (!loginDisponible.DISPONIBLE) {
                    loginMsg.style.cssText = "color:red; float:right; margin-right:30px";
                    loginMsg.textContent = "Usuario no disponible";
                    submitBtn.disabled = true;
                } else {
                    loginMsg.textContent = "";
                    submitBtn.disabled = false;
                }
            }).catch(err => {
                console.error(err);
            });
    }
    return loginDisponible;
}
async function compararPassword() {
    const pwdInput = document.getElementById("pwd"),
        pwd2Input = document.getElementById("pwd2"),
        pwdMsg = document.getElementById("msgPwd"),
        submitBtn = document.getElementById("submit"),
        samePwd = pwdInput.value === pwd2Input.value;
    if (samePwd) {
        pwdMsg.textContent = "";
        submitBtn.ariaDisabled = false;

    } else {
        pwdMsg.style.cssText = "color:red; float:right; margin-right:30px";
        pwdMsg.textContent = "Las contraseñas no son iguales";
        submitBtn.ariaDisabled = true;
    }
    return samePwd;
}

function mostrarFoto(inp) {
    const fichero = inp.files[0],
    imgSizeMsg = document.getElementById('msgImgSize'),
        img = document.getElementById('img'),
        fotoDefault = "images/empty_picture.png";

        if(img.src !== ""){
            eliminarFoto();
            if (inp.files && fichero) {
                var fileSize = fichero.size; // Tamaño del archivo en bytes
        
                if (fileSize > 300000) { // 300KB en bytes
                    imgSizeMsg.style.cssText = "color:red; float:right; margin-right:30px";
                    imgSizeMsg.textContent = "La imagen es demasiado grande (más de 300KB)";
                    inp.value = ""; // Limpiar el input
                    img.src = fotoDefault; // Mostrar la imagen por defecto
                } else {
                    img.src = URL.createObjectURL(fichero); // Leer el archivo y convertirlo a base64
                    imgSizeMsg.textContent = "";
                }
            } else {
                img.src = fotoDefault; // Mostrar la imagen por defecto
            }
        }
}

function mostrarFotoPub(inp) {
    const fichero = inp.files[0],
    imgSizeMsg = document.getElementsByClassName('msgImgSize')[0],
        fotoDefault = "images/no_foto.jpg";

        let img = inp.parentElement.querySelector('img');

            if (inp.files && fichero) {
                var fileSize = fichero.size; // Tamaño del archivo en bytes
        
                if (fileSize > 300000) { // 300KB en bytes
                    imgSizeMsg.style.cssText = "color:red; float:right; margin-right:30px";
                    imgSizeMsg.textContent = "La imagen es demasiado grande (más de 300KB)";
                    inp.value = ""; // Limpiar el input
                    img.src = fotoDefault; // Mostrar la imagen por defecto
                } else {
                    img.src = URL.createObjectURL(fichero); // Leer el archivo y convertirlo a base64
                    imgSizeMsg.textContent = "";
                }
            } else {
                img.src = fotoDefault; // Mostrar la imagen por defecto
            }
}

function eliminarFoto() {
    const img = document.getElementById("img"),
    fotoDefault = "images/empty_picture.png";;
    img.src = fotoDefault;
}

function eliminarFotoPub(btn) {
    let divFoto = btn.parentElement;
    divFoto.remove();
}