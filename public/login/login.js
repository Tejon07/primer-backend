// login.js

// Esperamos a que el DOM se cargue completamente
document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos los elementos del DOM necesarios
    const container = document.querySelector('.container');
    const loginForm = document.querySelector('.form-box.login form');
    const registerForm = document.querySelector('.form-box.register form');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');

    // ----------------------------------------
    // Funcionalidad para alternar vistas (login / registro)
    // ----------------------------------------
    registerBtn.addEventListener('click', () => {
        // Agrega una clase al contenedor para mostrar la vista de registro
        container.classList.add('active');
    });

    loginBtn.addEventListener('click', () => {
        // Quita la clase para volver a la vista de login
        container.classList.remove('active');
    });

    // ----------------------------------------
    // Funcionalidad para enviar el formulario de inicio de sesión
    // ----------------------------------------
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que el formulario se envíe normalmente

        // Obtenemos los valores ingresados por el usuario
        const username = loginForm.querySelector('input[type="text"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value.trim();

        // Validaciones básicas
        if (!username || !password) {
            alert('Por favor, completa todos los campos para iniciar sesión.');
            return;
        }

        try {
            // Realizamos una petición POST al endpoint de login
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Si el login fue exitoso, por ejemplo, redirigimos al usuario
                // o guardamos el token que retorne el backend en el localStorage/sessionStorage.
                // Suponiendo que el backend devuelve { token: '...', user: { ... } }
                localStorage.setItem('token', data.token);
                // Redirige a la página principal o dashboard
                window.location.href = '/dashboard';
            } else {
                // Si hubo un error (credenciales inválidas, usuario no encontrado, etc.)
                alert(data.message || 'Error al iniciar sesión. Verifica tus credenciales.');
            }
        } catch (error) {
            console.error('Error en la petición de inicio de sesión:', error);
            alert('Ocurrió un problema al conectar con el servidor. Intenta de nuevo más tarde.');
        }
    });

    // ----------------------------------------
    // Funcionalidad para enviar el formulario de registro
    // ----------------------------------------
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita el envío normal

        // Obtenemos los valores ingresados por el usuario
        const username = registerForm.querySelector('input[placeholder="Nombre de usuario"]').value.trim();
        const email = registerForm.querySelector('input[type="email"]').value.trim();
        const password = registerForm.querySelector('input[type="password"]').value.trim();

        // Validaciones básicas
        if (!username || !email || !password) {
            alert('Por favor, completa todos los campos para registrarte.');
            return;
        }

        try {
            // Realizamos una petición POST al endpoint de registro
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Si el registro fue exitoso, mostramos un mensaje y regresamos a la vista de login
                alert('Registro exitoso. Ahora puedes iniciar sesión con tus credenciales.');
                container.classList.remove('active');
                // O bien, redirigir directamente al login si se desea:
                // window.location.href = '/login';
            } else {
                // Si hubo un error (usuario ya existe, validación fallida, etc.)
                alert(data.message || 'Error al registrarse. Verifica tus datos e intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error en la petición de registro:', error);
            alert('Ocurrió un problema al conectar con el servidor. Intenta de nuevo más tarde.');
        }
    });
});
