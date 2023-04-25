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
    if (pagina !== undefined && registrosPorPagina !== undefined) {
        pagina = Number(pagina);
        registrosPorPagina = Number(registrosPorPagina);
    }

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

    if (pagina !== undefined && registrosPorPagina !== undefined) {
        if (!existeParametro) {
            urlPeticion += `?pag=${pagina}&lpag=${registrosPorPagina}`;
            existeParametro = true; //Aqui ya no es necesario ponerlo al ser el final
        } else
            urlPeticion += `&pag=${pagina}&lpag=${registrosPorPagina}`;
    }
    
    return urlPeticion;
}

function isLogged() {
    return sessionStorage.getItem('token') && sessionStorage.getItem('usuario');
}

function checkAccesoPagina(pagina) {
    const paginasPermitidas = {
        logged: ['index', 'buscar', 'nueva'], //PAGINAS ACCESIBLES SI LOGUEADO
        noLogged: ['index', 'buscar', 'login', 'registro'] //PAGINAS ACCESIBLES SI NO LOGUEADO
    };
    let accesible = false;
    let arrPaginas = null;

    //COMPROBAR SI ES LA PAGINA PUBLICACION, QUE PUEDEN ACCEDER LOGUEADOS Y NO LOGUEADOS
    //ES UNA SITUACION ESPECIAL EN LA PAGINA WEB
    if (location.href.split('/').pop().includes('publicacion') 
        || location.href.split('/').pop().includes('buscar')) {
        accesible = true;
    } else {
        //SELECCIONAR EL ARRAY POR EL QUE SE VA A BUSCAR PARA LA COMPROBACION
        if (isLogged())
            arrPaginas = paginasPermitidas.logged;
        else
            arrPaginas = paginasPermitidas.noLogged;

        arrPaginas.forEach(pag => {
            pag += '.html';
            if (pag === pagina)
                accesible = true;
        });
    }

    if (!accesible)
        location.href = 'index.html';
}

function getUserData() {
    const session = sessionStorage.getItem('usuario');
    const obj = JSON.parse(session);
    return obj;
}

function clearSessionData() {
    if (sessionStorage.getItem('token') && sessionStorage.getItem('usuario'))
        sessionStorage.clear();
}

function toggleFotos() {
    const divFotos = document.querySelector('div.publish-imgs');
    const btnToggle = document.querySelector('button.toggle');

    //OCULTAR O HACER VISIBLE SEGUN TENGA O NO EL ID DE OCULTAR
    if (btnToggle.hasAttribute('id')) {
        btnToggle.removeAttribute('id');
        divFotos.setAttribute('style', 'display: flex');
    } else {
        btnToggle.setAttribute('id', 'ocultar');
        divFotos.setAttribute('style', 'display: none');
    }
}

async function actualizaPaginacion(evt) {
    //COMPROBAR SI EXISTE PARAMETRO EN LA URL DE PAGINACION
    const valores = location.search;
    const urlParams = new URLSearchParams(valores);

    let pagActual = document.getElementsByClassName('pagActual')[0];
    let totalPags = document.getElementsByClassName('totalPags')[0];

    const botonesPaginacion = document.getElementsByTagName('button');
    
    if (parseInt(pagActual.textContent) === 1 && parseInt(totalPags.textContent) === 1) {
        
        botonesPaginacion.forEach(boton => {
            boton.setAttribute('disabled', true);
        });

    } else {
        let paginaPeticion = parseInt(pagActual.textContent) || undefined;

        //COMPROBAR QUE BOTON SE HA PULSADO
        if (evt.target.id === 'btnPrimeraPag') {
            pagActual.textContent = 1;
            paginaPeticion = 0;

            //DESHABILITAR BOTONES ANTERIOR Y PRIMERA PAGINA
            botonesPaginacion[0].removeAttribute('onclick');
            botonesPaginacion[1].removeAttribute('onclick');
            
            botonesPaginacion[2].setAttribute('onclick', 'actualizaPaginacion(event)');
            botonesPaginacion[3].setAttribute('onclick', 'actualizaPaginacion(event)');

            
        } else if (evt.target.id === 'btnAnteriorPag') {
            pagActual.textContent--;
            paginaPeticion = parseInt(pagActual.textContent)-1; //CALCULAR NUM PAGINA PARA LA PETICION

            botonesPaginacion[2].setAttribute('onclick', 'actualizaPaginacion(event)');
            botonesPaginacion[3].setAttribute('onclick', 'actualizaPaginacion(event)');

            if (parseInt(pagActual.textContent) === 1) {
                botonesPaginacion[0].removeAttribute('onclick');
                botonesPaginacion[1].removeAttribute('onclick');
            }

        } else if (evt.target.id === 'btnSiguientePag') {
            pagActual.textContent++;

            botonesPaginacion[0].setAttribute('onclick', 'actualizaPaginacion(event)');
            botonesPaginacion[1].setAttribute('onclick', 'actualizaPaginacion(event)');

            if (parseInt(pagActual.textContent) === parseInt(totalPags.textContent)) {
                botonesPaginacion[2].removeAttribute('onclick');
                botonesPaginacion[3].removeAttribute('onclick');
            }
            

        } else if (evt.target.id === 'btnUltimaPag') {
            pagActual.textContent = parseInt(totalPags.textContent);
            paginaPeticion = parseInt(totalPags.textContent)-1;

            botonesPaginacion[0].setAttribute('onclick', 'actualizaPaginacion(event)');
            botonesPaginacion[1].setAttribute('onclick', 'actualizaPaginacion(event)');

            //DESHABILITAR BOTONES SIGUIENTE Y ULTIMA PAGINA
            botonesPaginacion[2].removeAttribute('onclick');
            botonesPaginacion[3].removeAttribute('onclick');

        }

        const urlParams = new URLSearchParams(valores);
        const parametrosPeticion = {
            titulo: urlParams.get('t') || undefined,
            zona: urlParams.get('z') || undefined,
            fechaDesde: urlParams.get('fd') || undefined,
            fechaHasta: urlParams.get('fh') || undefined,
            pagina: paginaPeticion,
            registrosPorPagina: parseInt(urlParams.get('lpag')) || 6
        };

        console.log(parametrosPeticion);

        const publicaciones = await getPublicacionesFiltro(parametrosPeticion);//LA PAGINA 0 ES LA PRIMERA PAGINA

        //LIMPIAR LAS PUBLICACIONES ANTERIORES
        document.querySelector('div#notices').innerHTML = '';

        creaPublicaciones(publicaciones);
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
    let divPubs = document.getElementById('notices');

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

    //LLAMAR AL SERVICIO DE BUSQUEDA DE PUBLICACIONES FILTRADAS
    const publicaciones = await getPublicacionesFiltro({ titulo, fechaDesde, fechaHasta, zona, registrosPorPagina: 6, pagina: 0 });
    console.log(publicaciones);

    //LIMPIAR LAS PUBLICACIONES ANTERIORES
    document.querySelector('div#notices').innerHTML = '';

    creaPublicaciones(publicaciones);
    
    const botonesPaginacion = document.getElementsByTagName('button');
    let pagActual = document.getElementsByClassName('pagActual')[0];
    let totalPags = document.getElementsByClassName('totalPags')[0];
    pagActual.textContent = 1; //AL INICIAR LA PAGINA SIEMPRE EMPIEZA POR LA PRIMERA PAGINA
    totalPags.textContent = Math.ceil(publicaciones.TOTAL_COINCIDENCIAS/publicaciones.LPAG); //REDONDEA HACIA ARRIBA PARA OBTENER LAS PAGINAS TOTALES

    if (parseInt(pagActual.textContent) === 1 && parseInt(totalPags.textContent) === 1) {
        botonesPaginacion[0].setAttribute('disabled', true);
        botonesPaginacion[1].setAttribute('disabled', true);
        botonesPaginacion[2].setAttribute('disabled', true);
        botonesPaginacion[3].setAttribute('disabled', true);
    } else {
        //DESHABILITAR BOTONES DE PAGINA ANTERIOR AL SER LA PRIMERA PAGINA MOSTRADA
        const btnPrimeraPag = botonesPaginacion[0];
        const btnPagAnterior = botonesPaginacion[1];
        btnPrimeraPag.setAttribute('disabled', true);
        btnPagAnterior.setAttribute('disabled', true);
    }


    //return publicaciones;
}

function crearModalLogin(r) {
    let modal = creaPropiedadesModal();
    modal.innerHTML = `
        <h3>Usuario ${r.LOGIN} logueado correctamente</h3>
        <p>Última vez conectado: ${r.ULTIMO_ACCESO}</p>
        <button class="modal" onclick="cerrarModal({ redireccion: 'index' })">Cerrar</button>
    `;

    document.body.appendChild(modal);
    modal.showModal();
}

function crearModalComentario(r) {
    let modal = creaPropiedadesModal();
    modal.innerHTML = `
        <h3>${r.DESCRIPCION}</h3>
        <button class="modal" onclick="cerrarModal({})">Cerrar</button>
    `;

    document.body.appendChild(modal);
    modal.showModal();
}

function crearModalError(r) {
    let modal = creaPropiedadesModal();
    modal.innerHTML = `
        <h3>${r.DESCRIPCION}</h3>
        <button onclick="cerrarModal({ focus: 'login' })">Cerrar</button>
    `;

    document.body.appendChild(modal);
    modal.showModal();
}

//FUNCION PARA PREPARAR CUALQUIER MODAL, ESTABLECE SUS ESTILOS PRINCIPALES
function creaPropiedadesModal() {
    let dialogo = document.createElement('dialog');
    dialogo.style.padding = '25px';
    dialogo.style.fontFamily = 'Arial';
    dialogo.style.position = 'fixed';
    dialogo.style.top = '50%';
    dialogo.style.left = '50%';
    dialogo.style.transform = 'translate(-50%, -50%)';
    return dialogo;
  }

function cerrarModal({ redireccion, focus }) {
    document.querySelector('dialog').close();
    document.querySelector('dialog').remove();
    
    if (redireccion) { //REDIRECCIONAR A LA PAGINA, SI SE QUIERE
        location.href = `${redireccion}.html`;
    }

    if (focus) { //COLOCAR FOCO DE NUEVO, SI SE QUIERE
        document.getElementById(focus).focus();
    }
}