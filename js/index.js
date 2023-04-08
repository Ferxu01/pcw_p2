
document.addEventListener('DOMContentLoaded', async () => {
    /*const datos = await postLogin({ login: 'fernando', pwd: 1234});
    console.warn(datos);*/

    const publicaciones = await getPublicaciones();

    const divPubs = document.getElementById('notices');
    (publicaciones.FILAS).forEach(pub => {
        const publicacion = document.createElement('article');
        publicacion.classList.add('notice-container');
        
        const headerLink = document.createElement('a');
        headerLink.href = 'enlace de publicacion';
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
});