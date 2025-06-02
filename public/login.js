// Mostrar sólo un formulario a la vez
const loginBox = document.querySelector('.form-box.login');
const registerBox = document.querySelector('.form-box.register');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

function showLogin() {
    loginBox.classList.add('active');
    registerBox.classList.remove('active');
}
function showRegister() {
    registerBox.classList.add('active');
    loginBox.classList.remove('active');
}
registerBtn.addEventListener('click', showRegister);
loginBtn.addEventListener('click', showLogin);
showLogin(); // Mostrar login al cargar

// Manejo de login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.email.value.trim();
    const password = this.password.value;
    const loginError = document.getElementById('loginError');
    loginError.textContent = "";

    try {
        const res = await fetch('../../src/auth/rutas', {
         rutasthod: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.data && data.data.token) {
            // Guarda el token en localStorage (opcional)
            localStorage.setItem('authToken', data.data.token);
            // Redirige a la página principal o dashboard
            window.location.href = "/";
        } else {
            loginError.textContent = data.mensaje || data.message || "Credenciales incorrectas.";
        }
    } catch (err) {
        loginError.textContent = "Error de conexión.";
    }
});

// Manejo de registro
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = this.nombre.value.trim();
    const email = this.email.value.trim();
    const password = this.password.value;
    const telefono = this.telefono.value.trim();
    const direccion = this.direccion.value.trim();
    const registerError = document.getElementById('registerError');
    registerError.textContent = "";

    try {
        const res = await fetch('../../src/auth/rutas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nombre, email, password, telefono, direccion })
        });
        const data = await res.json();
        if (res.ok && data.usuario) {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            showLogin();
        } else if (res.ok && data.mensaje) {
            alert(data.mensaje);
            showLogin();
        } else {
            registerError.textContent = data.mensaje || data.message || "Error al registrarse.";
        }
    } catch (err) {
        registerError.textContent = "Error de conexión.";
    }
});