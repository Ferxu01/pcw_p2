function formateaFecha(fecha) {
    const nuevaFecha = new Date(fecha);
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    const diaSemana = diasSemana[nuevaFecha.getDay()];
    const dia = nuevaFecha.getDate();
    const mes = meses[nuevaFecha.getMonth()];
    const anyo = nuevaFecha.getFullYear();
    
    const fechaFormateada = `${diaSemana}, ${dia} de ${mes} de ${anyo}`;
    //Formato: lunes, 18 de febrero de 2023
    return fechaFormateada;
}

function prepareUrlFiltro({ titulo, zona, fechaDesde, fechaHasta, pagina, registrosPorPagina }) {
    let urlPeticion = 'api/publicaciones';
    let existeParametro = false;

    if (titulo) {
        if (!existeParametro) {
            urlPeticion += `?t=${titulo}`;
            existeParametro = true;
        } else
            urlPeticion += `&t=${titulo}`;
    }
    
    if (zona) {
        if (!existeParametro) {
            urlPeticion += `?z=${zona}`;
            existeParametro = true;
        } else
            urlPeticion += `&z=${zona}`;
    }

    if (fechaDesde) {
        //Helper para comprobar el formato de la fecha por parametro
        if (!existeParametro) {
            urlPeticion += `?fd=${fechaDesde}`;
            existeParametro = true;
        } else
            urlPeticion += `&fd=${fechaDesde}`;
    }

    if (fechaHasta) {
        //Helper para comprobar el formato de la fecha por parametro
        if (!existeParametro) {
            urlPeticion += `?fh=${fechaHasta}`;
            existeParametro = true;
        } else
            urlPeticion += `&fh=${fechaHasta}`;
    }

    if (pagina && registrosPorPagina)
        urlPeticion += `?pag=${pagina}&lpag=${registrosPorPagina}`;

    console.log(urlPeticion);
    
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

function creaPublicaciones(publicaciones) {
    const divPubs = document.getElementById('notices');

    (publicaciones.FILAS).forEach(pub => {
        const publicacion = document.createElement('article');
        publicacion.classList.add('notice-container');
        
        const headerLink = document.createElement('a');
        headerLink.href = `publicacion.html?id=${pub.id}`;
        headerLink.text = pub.titulo;
        const header = document.createElement('h3');
        header.classList.add('notice-title');
        header.title = pub.titulo;
        header.appendChild(headerLink);

        const imgLink = document.createElement('a');
        imgLink.href = `publicacion.html?id=${pub.id}`;

        const pubImg = document.createElement('img');
        pubImg.src = '/pcw/practica2/fotos/pubs/'+pub.imagen;
        pubImg.alt = 'Foto noticia';
        imgLink.appendChild(pubImg);

        publicacion.appendChild(header);
        publicacion.appendChild(imgLink);

        publicacion.innerHTML += `
            <div class="info">
                <div class="notice-date">
                    <p>${pub.fechaCreacion}</p>
                    <img class="small-icon-2" src="images/icons/svg/calendar-icon.svg" alt="calendar icon">
                </div>
                <div class="username">
                    <p>${pub.autor}</p>
                    <img class="small-icon-1" src="images/icons/svg/user-icon.svg" alt="user icon">
                </div>
            </div>
        `;

        divPubs.appendChild(publicacion);
    });
}

async function realizaBusqueda(evt) {
    evt.preventDefault();

    const titulo = document.querySelector('input[name=titulo]').value || undefined;
    const fechaDesde = document.querySelector('input[name=fechaDesde]').value || undefined;
    const fechaHasta = document.querySelector('input[name=fechaHasta]').value || undefined;
    const zona = document.querySelector('input[name=zona]').value || undefined;
    console.log(titulo);
    console.log(fechaDesde);
    console.log(fechaHasta);
    console.log(zona);

    //LLAMAR AL SERVICIO DE BUSQUEDA DE PUBLICACIONES FILTRADAS
    const publicaciones = await getPublicacionesFiltro({ titulo, fechaDesde, fechaHasta, zona });
    console.warn(publicaciones);
    return publicaciones;
}