let usuarioLogueado = getUserData() || undefined;

(function() {
    const logout = document.querySelector('span.logout');

    if (location.href !== 'index.html') {
        const pagina = location.href.split('/').pop();
        checkAccesoPagina(pagina);
    }

    if (isLogged()) {
        //Ocultar los enlaces de LOGIN y REGISTRO
        //Aparecerá el enlace de NUEVA y LOGOUT
        const login = document.querySelector('span.login');
        const registro = document.querySelector('span.registro');
        login.parentElement.parentElement.remove();
        registro.parentElement.parentElement.remove();

        logout.textContent += `(${usuarioLogueado.LOGIN})`;
    } else {
        const nueva = document.querySelector('span.nueva');
        logout.parentElement.parentElement.remove();
        nueva.parentElement.parentElement.remove();
    }
})();