let usuarioLogueado = getUserData() || undefined;

(function() {
    const logout = document.querySelector('span.logout');

    if (isLogged()) {
        console.log('logged');
        
        //Ocultar los enlaces de LOGIN y REGISTRO
        //Aparecerá el enlace de NUEVA y LOGOUT
        const login = document.querySelector('span.login');
        const registro = document.querySelector('span.registro');
        login.parentElement.parentElement.remove();
        registro.parentElement.parentElement.remove();


        logout.textContent += ` (${usuarioLogueado.LOGIN})`; //VER ATRIBUTO USUARIO Y EDITAR

        const pagina = location.href.split('/').pop();
        if (pagina == ('login.html' || 'registro.html')) { //REVISAR LAS PAGINAS A LAS QUE SE PUEDE ACCEDER
            location.href = 'index.html'; //Redirigir al index
        }
    } else {
        console.log('not logged');
        //Ocultar LOGOUT y NUEVA
        
        const nueva = document.querySelector('span.nueva');
        logout.parentElement.parentElement.remove();
        nueva.parentElement.parentElement.remove();
        console.warn('no logueado');
        
        const pagina = location.href.split('/').pop();
        if (pagina == ('nueva.html')) { //REVISAR LAS PAGINAS A LAS QUE SE PUEDE ACCEDER
            location.href = 'index.html'; //Redirigir al index
        }
    }
})();