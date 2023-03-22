'use strict';

function peticionFetchAPI_GET() {
    let url = 'api/zonas';

    fetch(url).then(res => {
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
    })
    .catch(err => {
        console.error(err);
    });
}