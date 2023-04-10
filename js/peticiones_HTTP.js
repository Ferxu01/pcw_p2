'use strict';

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

async function getZonas() {
    let url = 'api/zonas';
    //let response;

    const res = await fetch(url);
    let zonas = await res.json();

    console.log(zonas);
    /*fetch(url).then(res => {
        if (res.ok) {
            console.log(res);
            return res.json();
        } else {
            console.log('Error(' + res.status + '): ' + res.statusText);
            return;
        }
    })
    .then(data => {
        console.log(data);
        response = data;
        return data;
    })
    .catch(err => {
        console.error(err);
    });*/

    return zonas;
}

async function getPublicaciones() {
    const url = 'api/publicaciones';
    const res = await fetch(url);
    const publicaciones = await res.json();

    console.log(publicaciones);
    return publicaciones;
}

async function getPublicacionesFiltro({ titulo, zona, fechaDesde, fechaHasta, pagina, registrosPorPagina }) {
    //Obtener la url a partir de los datos del filtrado
    const url = prepareUrlFiltro({ titulo, zona, fechaDesde, fechaHasta, pagina, registrosPorPagina });
    
    const res = await fetch(url);
    const publicaciones = await res.json();

    console.log(publicaciones);
    return publicaciones;
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
        const { TOKEN, LOGIN, NOMBRE, FOTO, ULTIMO_ACCESO} = r;
        const obj = {
            NOMBRE,
            LOGIN,
            FOTO,
            TOKEN,
            ULTIMO_ACCESO
        };

        sessionStorage.setItem('usuario', JSON.stringify(obj));
        sessionStorage.setItem('token', r.TOKEN);
        location.href = 'index.html';
    };

    xhr.send(fd);
}

function postLogout() {
    /*fetch(url, {
        method: 'POST',
        headers: {
            'Authoritation': auth
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(datos => {
                console.log(datos);
            });
        }
    }).catch(error => {
        console.error(error);
    });*/

    let xhr = new XMLHttpRequest(),
        url = 'api/usuarios/logout',
        usu = getUserData(),
        auth;
    
    xhr.open('POST', url, true);
    xhr.responseType = 'json';

    xhr.onload = function(){
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
    
}

function postPublicacion(evt) {
    
}

function postComentario(frm, id) {
    //const id = location.href.split('/');
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
            //ANYADIR COMENTARIO POR HTML A LA LISTA
            actualizaComentarios(id);
            const form = document.querySelector('form');
            form.reset();
            //MOSTRAR MENSAJE MODAL
            
        }

        console.log(r);
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
            const btnLike = document.querySelector('button#like');
            btnLike.classList.toggle('disabled');

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

            const btnDislike = document.querySelector('button#dislike');
            btnDislike.classList.toggle('disabled');

            console.log(r);
            resolve(r);
        };
        auth = usu.LOGIN + ':' + usu.TOKEN;
        xhr.setRequestHeader('Authorization', auth);
        xhr.send();
    });
}

/*function getUsuario() {
    console.log(usuario);
    return usuario;
}*/