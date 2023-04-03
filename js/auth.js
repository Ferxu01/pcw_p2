(function() {
    sessionStorage.setItem('token', 'miToken');
    const logout = document.querySelector('span.logout');

    if (isLogged()) {
        console.log('logged');
        
        //Ocultar los enlaces de LOGIN y REGISTRO
        //Aparecerá el enlace de NUEVA y LOGOUT
        const login = document.querySelector('span.login');
        const registro = document.querySelector('span.registro');
        login.parentElement.parentElement.remove();
        registro.parentElement.parentElement.remove();
        const usuario = 'Fernando';
        logout.textContent += ` (${usuario})`; //VER ATRIBUTO USUARIO Y EDITAR
        //login.parentElement.parentElement.setAttribute('display', 'none');
    } else {
        console.log('not logged');
        //Ocultar LOGOUT y NUEVA
        
        const nueva = document.querySelector('span.nueva');
        logout.parentElement.parentElement.remove();
        nueva.parentElement.parentElement.remove();
    }
})();