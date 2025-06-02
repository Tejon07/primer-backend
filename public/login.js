document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Guardar el token (puede ser en localStorage o cookies)
                localStorage.setItem('token', data.token);
                // Redirigir al dashboard o página principal
                window.location.href = '/dashboard';
            } else {
                // Mostrar mensaje de error
                alert(data.mensaje || 'Credenciales incorrectas');
            }
        } catch (error) {
            alert('Error al conectar con el servidor');
        }
    });
});