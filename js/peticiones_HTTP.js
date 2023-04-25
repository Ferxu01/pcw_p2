'use strict';

function getFormComentario() {
    const url = 'formulario.html';
    fetch(url)
        .then(res => res.text())
        .then(data => {
            document.querySelector('div.form-area').innerHTML = data;
        });
}

function getDisponibilidadLogin(login) {
    const url = `api/usuarios/${login}`;
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let disponible = xhr.response;
            resolve(disponible);
        };
        xhr.send();
    });
}

function getZonas() {
    let url = 'api/zonas';
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let zonas = xhr.response;
            resolve(zonas);
        };

        xhr.send();
    });
}

function getPublicaciones() {
    const url = 'api/publicaciones';
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let publicaciones = xhr.response;
            resolve(publicaciones);
        };

        xhr.send();
    });
}

function getPublicacionesFiltro({ titulo, zona, fechaDesde, fechaHasta, pagina, registrosPorPagina }) {
    //Obtener la url a partir de los datos del filtrado
    const url = prepareUrlFiltro({ titulo, zona, fechaDesde, fechaHasta, pagina, registrosPorPagina });

    console.log(url);
    
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let publicaciones = xhr.response;
            resolve(publicaciones);
        };

        xhr.send();
    });
}

function getPublicacion(id) {
    const url = `api/publicaciones/${id}`;
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let publicaciones = xhr.response;
            resolve(publicaciones);
        };

        if (isLogged()) {
            const usu = getUserData();
            const auth = usu.LOGIN + ':' + usu.TOKEN;
            xhr.setRequestHeader('Authorization', auth);
        }
        xhr.send();
    });
}

function getFotosPublicacion(id) {
    const url = `api/publicaciones/${id}/fotos`;
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let fotos = xhr.response;
            resolve(fotos);
        };
        xhr.send();
    });
}

function getComentariosPublicacion(id) {
    const url = `api/publicaciones/${id}/comentarios`;
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let comentarios = xhr.response;
            resolve(comentarios);
        };
        xhr.send();
    });
}

function postLogin(evt) {
    evt.preventDefault();
    
    const frm = evt.currentTarget,
        xhr = new XMLHttpRequest(),
        url = 'api/usuarios/login',
        fd = new FormData(frm);
    
    xhr.open('POST', url, true);
    xhr.responseType = 'json';

    xhr.onload = () => {
        let r = xhr.response;

        if (r.CODIGO === 200) {
            const { TOKEN, LOGIN, NOMBRE, FOTO, ULTIMO_ACCESO } = r;
            const obj = {
                NOMBRE,
                LOGIN,
                FOTO,
                TOKEN,
                ULTIMO_ACCESO
            };

            sessionStorage.setItem('usuario', JSON.stringify(obj));
            sessionStorage.setItem('token', r.TOKEN);
            crearModalLogin(r);
        } else {
            crearModalError(r);
        }
    };

    xhr.send(fd);
}

function postLogout() {
    let xhr = new XMLHttpRequest(),
        url = 'api/usuarios/logout',
        usu = getUserData(),
        auth;
    
    xhr.open('POST', url, true);
    xhr.responseType = 'json';

    xhr.onload = () => {
        let r = xhr.response;

        if (r.CODIGO === 200) {
            //ELIMINAR EL TOKEN Y EL USUARIO DE SESSION STORAGE
            clearSessionData();
            location.href = 'index.html';
        }

        console.log(r);
    };
    auth = usu.LOGIN + ':' + usu.TOKEN;
    xhr.setRequestHeader('Authorization', auth);
    xhr.send();
}

function postRegistro(evt) {
    evt.preventDefault();
    
    const frm = evt.currentTarget,
        xhr = new XMLHttpRequest(),
        url = 'api/usuarios/registro',
        fd = new FormData(frm);
    
    xhr.open('POST', url, true);
    xhr.responseType = 'json';

    xhr.onload = () => {
        let r = xhr.response;

        console.log(r);
    };

    xhr.send(fd);
}

function postPublicacion(evt) {
    
}

function postComentario(frm) {
    //OBTENER EL ID DE LA PUBLICACION
    const valores = location.search;
    const urlParams = new URLSearchParams(valores);
    const id = urlParams.get('id') || undefined;
    console.log(id);

    let xhr = new XMLHttpRequest(),
        url = `api/publicaciones/${id}/comentarios`,
        fd = new FormData(frm),
        usu = getUserData(),
        auth;
    
    xhr.open('POST', url, true);
    xhr.responseType = 'json';

    xhr.onload = function(){
        let r = xhr.response;

        if (r.CODIGO === 201) {
            document.querySelector('form').reset();
            crearModalComentario(r);
            //ANYADIR COMENTARIO POR HTML A LA LISTA
            actualizaComentarios(id);
        }
    };
    auth = usu.LOGIN + ':' + usu.TOKEN;
    xhr.setRequestHeader('Authorization', auth);
    xhr.send(fd);

    return false;
}

function postMeGusta(id) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest(),
            url = `api/publicaciones/${id}/megusta`,
            usu = getUserData(),
            auth;

        xhr.open('POST', url, true);
        xhr.responseType = 'json';

        xhr.onload = () => {
            let r = xhr.response;
            const btnDislike = document.querySelector('button#dislike');
            const spanLike = document.querySelector('span.numLikes');
            spanLike.textContent = r.nMeGusta; //Actualizar numero de dislikes
            
            btnDislike.classList.toggle('disabled');
            if (r.meGusta === -1) {
                btnDislike.removeAttribute('disabled');
            } else if (r.meGusta === 1) {
                btnDislike.setAttribute('disabled', true);
            }

            console.log(r);
            resolve(r);
        };
        auth = usu.LOGIN + ':' + usu.TOKEN;
        xhr.setRequestHeader('Authorization', auth);
        xhr.send();
    });
}

function postNoMeGusta(id) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest(),
            url = `api/publicaciones/${id}/nomegusta`,
            usu = getUserData(),
            auth;

        xhr.open('POST', url, true);
        xhr.responseType = 'json';

        xhr.onload = () => {
            let r = xhr.response;

            const btnLike = document.querySelector('button#like');
            const spanDislike = document.querySelector('span.numDislikes');
            spanDislike.textContent = r.nNoMeGusta; //Actualizar numero de dislikes

            btnLike.classList.toggle('disabled');
            if (r.meGusta === -1) {
                btnLike.removeAttribute('disabled');
            } else if (r.meGusta === 0) {
                btnLike.setAttribute('disabled', true);
            }

            console.log(r);
            resolve(r);
        };
        auth = usu.LOGIN + ':' + usu.TOKEN;
        xhr.setRequestHeader('Authorization', auth);
        xhr.send();
    });
}