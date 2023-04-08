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