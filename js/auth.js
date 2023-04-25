let usuarioLogueado = getUserData() || undefined;

(function() {
    const logout = document.querySelector('span.logout');

    

    if (location.href !== 'index.html') {
        const pagina = location.href.split('/').pop();
        console.log(pagina);
        checkAccesoPagina(pagina);
    }


    if (isLogged()) {
        console.log('logged');
        
        //Ocultar los enlaces de LOGIN y REGISTRO
        //Aparecerá el enlace de NUEVA y LOGOUT
        const login = document.querySelector('span.login');
        const registro = document.querySelector('span.registro');
        login.parentElement.parentElement.remove();
        registro.parentElement.parentElement.remove();

        logout.textContent += ` (${usuarioLogueado.LOGIN})`; //VER ATRIBUTO USUARIO Y EDITAR
    } else {
        console.log('not logged');
        //Ocultar LOGOUT y NUEVA
        
        const nueva = document.querySelector('span.nueva');
        logout.parentElement.parentElement.remove();
        nueva.parentElement.parentElement.remove();
        
        //const pagina = location.href.split('/').pop();
        /*if (pagina !== 'index.html') { //REVISAR LAS PAGINAS A LAS QUE SE PUEDE ACCEDER
            location.href = 'index.html'; //Redirigir al index
        }*/
    }
})();