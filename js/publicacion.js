document.addEventListener('DOMContentLoaded', async () => {
    //OBTENER EL ID DE LA URL DE LA PAGINA
    const valores = location.search;
    const urlParams = new URLSearchParams(valores);
    const idPub = urlParams.get('id');
    console.log(idPub);

    if (!idPub) {
        location.href = 'index.html';
    } else {
        //HACER PETICION AL SERVIDOR PARA OBTENER LOS DATOS
        const respData = await getPublicacion(idPub);
        const publicacion = respData.FILAS[0];
        const respComments = await getComentariosPublicacion(idPub);
        const comentarios = respComments.FILAS;
        //console.log(comentarios);
        const respImages = await getFotosPublicacion(idPub);
        const images = respImages.FILAS;
        
        //CREAR EL APARTADO DE FOTOS DE LA PUBLICACION
        const divImg = document.createElement('div');
        divImg.classList.add('publish-imgs');

        images.forEach(pubElem => {
            let divImgCont = document.createElement('div');
            divImgCont.classList.add('img-container');
            let image = document.createElement('img');
            image.src = 'fotos/pubs/' + pubElem.archivo;
            image.title = 'Ver foto en grande';
            image.alt = 'Foto de publicación ' + pubElem.idPublicacion;
            let imgText = document.createElement('p');
            imgText.textContent = pubElem.descripcion;
            divImgCont.appendChild(image);
            divImgCont.appendChild(imgText);

            divImg.appendChild(divImgCont);
        });


        //CREAR LOS COMENTARIOS DE LA PUBLICACION
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


        //CREAR LA PÁGINA DE LA PUBLICACION CON SUS DATOS
        const section = document.querySelector('section');
        section.innerHTML += `
            <h2>${publicacion.titulo}</h2>
            <hr>
            <article class="publish-container">
                <div class="publish-body">
                    <p class="publish-descrip">${publicacion.texto}</p>
                    <p>Ubicación: <a href="">${publicacion.nombreZona}</a></p>
                </div>
                <hr>

                <div class="publish-info">
                    <div class="user-info">
                        <img class="sm-icon-height" src="images/icons/svg/user-icon.svg" alt="user icon">
                        <span>${publicacion.autor}</span> <br>
                        <div class="comment-date">
                            <img class="sm-icon-height" src="images/icons/svg/calendar-icon.svg" alt="icono calendario">
                            <span>${publicacion.fechaCreacion}</span>
                        </div>
                    </div>

                    <div class="likes-info">
                        <button onclick="postMeGusta(${idPub})" id="like" class="btn-valoracion"> <img class="sm-icon-height" src="images/icons/svg/like-icon.svg" alt="icono like"> Me gusta (<span class="numLikes">${publicacion.nMeGusta}</span>)</button> <br>
                        <button onclick="postNoMeGusta(${idPub})" id="dislike" class="btn-valoracion"> <img class="sm-icon-height" src="images/icons/svg/dislike-icon.svg" alt="icono dislike"> No me gusta (<span class="numDislikes">${publicacion.nNoMeGusta}</span>)</button>
                    </div>
                    <div class="comments-info">
                        <img class="sm-icon-height" src="images/icons/svg/comment-icon.svg" alt="comment icon">
                        <span class="numComments">${comentarios.length}</span> <a href="#comentarios">comentarios</a>
                    </div>
                </div>
                <hr>

                <h2>Fotos:</h2>

                <hr>
                ${divImg.outerHTML}
            </article>

            <h2 id="comentarios">Comentarios:</h2>
            <hr>
            <article class="comments">
                <h3>&nbsp;</h3>
                ${divComments.outerHTML}
                <div class="form-area">
                    
                </div>
            </article>
        `;

    }

    const formArea = document.querySelector('div.form-area');

    if (!isLogged()) {
        /*const formComment = document.querySelector('form');
        formComment.remove();*/

        //MOSTRAR MENSAJE DE LOGUEO
        formArea.innerHTML = `
            <p>Tienes que estar <a href="login.html">logueado</a> para poder dejar un comentario</p>
        `;

        //DESHABILITAR BOTONES DE ME GUSTA Y NO ME GUSTA
        const botones = document.querySelectorAll('button.btn-valoracion');
        botones.forEach(btn => {
            btn.setAttribute('disabled', true);
            btn.classList.add('disabled'); //EFECTO VISUAL DE BOTON DESHABILITADO
        });
    } else {
        //MOSTRAR FORMULARIO
        formArea.innerHTML = `
            <form onsubmit="return postComentario(this,${idPub});">
                <label for="texto">Deja tu comentario...</label>
                <br>
                <textarea name="texto" id="texto" maxlength="250"></textarea>
                <input type="submit" value="Enviar">
                <input type="reset" value="Limpiar">
            </form>
        `;

        //COMPROBAR LIKE O DISLIKE DEL USUARIO Y AGREGARLO AL BOTON CORRESPONDIENTE
        const btnLike = document.querySelector('button#like');
        const btnDislike = document.querySelector('button#dislike');
        const respData = await getPublicacion(idPub);
        const publicacion = respData.FILAS[0];
        console.log(publicacion);

        //REVISAR: publicacion.meGusta de valor 0 se refiere al usuario que da dislike?
        //REVISAR: publicacion.meGusta de valor 1 se refiere al usuario que da like?

        if (publicacion.meGusta === 1) { //USUARIO TIENE UN LIKE
            btnDislike.classList.add('disabled');
            btnDislike.setAttribute('disabled', true);

        } else if (publicacion.meGusta === 0) { //USUARIO TIENE UN DISLIKE
            btnLike.classList.add('disabled');
            btnLike.setAttribute('disabled', true);

        }
    }
});