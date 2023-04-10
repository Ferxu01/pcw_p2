function prepareUrlFiltro({ titulo, zona, fechaDesde, fechaHasta, pagina, registrosPorPagina }) {
    let urlPeticion = 'api/publicaciones';
    if (titulo)
        urlPeticion += `?t=${titulo}`;
    if (zona)
        urlPeticion += `?z=${zona}`;
    if (fechaDesde)
        urlPeticion += `?fd=${fechaDesde}`;
    if (fechaHasta)
        urlPeticion += `?fh=${fechaHasta}`;
    if (pagina && registrosPorPagina)
        //Helper para comprobar el formato de la fecha por parametro
        urlPeticion += `?pag=${pagina}&lpag=${registrosPorPagina}`;
    
    return urlPeticion;
}

function isLogged() {
    return sessionStorage.getItem('token') && sessionStorage.getItem('usuario');
}

function getUserData() {
    const session = sessionStorage.getItem('usuario');
    const obj = JSON.parse(session);
    return obj;
}

function clearSessionData() {
    if (sessionStorage.getItem('token') && sessionStorage.getItem('usuario')) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
    }
}

async function actualizaComentarios(id) {
    const numComentarios = document.querySelector('span.numComments');
    const article = document.querySelector('article.comments');
    
    const res = await getComentariosPublicacion(id);
    let comentarios = res.FILAS;

    //CREAR LA ESTRUCTURA DE LOS COMENTARIOS
    const divComments = document.createElement('div');
    divComments.classList.add('comments-container');
        
    comentarios.forEach(comentario => {
        const userComment = document.createElement('div');
        userComment.classList.add('user-comment');

        const divUserAvatar = document.createElement('div');
        divUserAvatar.classList.add('user-avatar');
        const imgAvatar = document.createElement('img');
        imgAvatar.src = 'fotos/usuarios/' + comentario.foto;
        imgAvatar.alt = 'Avatar ' + comentario.login;
        const pNick = document.createElement('p');
        pNick.textContent = comentario.login;
        const divComment = document.createElement('div');
        divComment.classList.add('comment');
        const pComentario = document.createElement('p');
        pComentario.textContent = comentario.texto;
        const htmlFecha = `
            <div class="comment-date">
                <img class="md-icon-height" src="images/icons/svg/calendar-icon.svg" alt="icono calendario">
                <span>${comentario.fechaHora}</span>
            </div>
        `;
        divUserAvatar.appendChild(imgAvatar);
        divUserAvatar.appendChild(pNick);
        divComment.appendChild(pComentario);
        divComment.innerHTML += htmlFecha;
        userComment.appendChild(divUserAvatar);
        userComment.appendChild(divComment);

        divComments.appendChild(userComment);
        divComments.innerHTML += '<hr>';
    });

    article.innerHTML = `
        <h3>&nbsp;</h3>
        ${divComments.outerHTML}
        <div class="form-area">
            <form onsubmit="return postComentario(this,${id});">
                <label for="texto">Deja tu comentario...</label>
                <br>
                <textarea name="texto" id="texto" maxlength="250"></textarea>
                <input type="submit" value="Enviar">
                <input type="reset" value="Limpiar">
            </form>
        </div>
    `;

    numComentarios.textContent = comentarios.length;
}