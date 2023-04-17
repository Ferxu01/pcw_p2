'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const publicaciones = await getPublicaciones();
    creaPublicaciones(publicaciones);
});