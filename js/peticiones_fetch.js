'use strict';

async function peticionFetchAPI_GET() {
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

