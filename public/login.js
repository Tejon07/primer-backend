// Asume que tienes una variable API_BASE definida, ejemplo:
// const API_BASE = '/api/auth';

const API_BASE = '/api/auth';

// Función para mostrar mensajes en pantalla
function mostrarMensaje(mensaje, tipo = 'info') {
    // Implementa esto según tu frontend
    alert(mensaje); // Puedes reemplazarlo por un modal, toastr, etc.
}

// Función para hacer peticiones a la API
async function apiRequest(endpoint, method, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const responseText = await response.text();
        if (!responseText) {
            throw new Error('Respuesta vacía del servidor');
        }
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error parsing JSON:', responseText);
            throw new Error('Respuesta inválida del servidor');
        }
        if (!response.ok) {
            throw new Error(result.body || 'Error en la petición');
        }
        return result;
    } catch (error) {
        console.error('Error en apiRequest:', error);
        throw error;
    }
}

// Selecciona el formulario de login, asume que tiene id 'loginForm'
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="text"]').value;
    const password = this.querySelector('input[type="password"]').value;

    if (!email || !password) {
        mostrarMensaje('Por favor, complete todos los campos', 'error');
        return;
    }

    // Mostrar estado de carga
    const submitBtn = this.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Iniciando sesión...';
    submitBtn.disabled = true;
    this.classList.add('form-loading');

    try {
        const response = await apiRequest('/login', 'POST', { email, password });
        const { token, usuario } = response.body.data;

        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        mostrarMensaje('¡Login exitoso! Redirigiendo...', 'success');

        // Redireccionar según el rol
        setTimeout(() => {
            switch(usuario.rol) {
                case 'master':
                case 'admin':
                    window.location.href = '/admin/dashboard.html';
                    break;
                case 'entregador':
                    window.location.href = '/delivery/dashboard.html';
                    break;
                case 'cliente':
                default:
                    window.location.href = '/tienda/index.html';
            }
        }, 1500);
    } catch (error) {
        console.error('Error completo:', error);
        mostrarMensaje(error.message, 'error');
    } finally {
        // Restaurar estado del botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        this.classList.remove('form-loading');
    }
});

// Verificar si ya hay una sesión activa al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_BASE}/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const responseText = await response.text();
                if (responseText) {
                    const result = JSON.parse(responseText);
                    const usuario = result.body.usuario;
                    // Redireccionar si ya está autenticado
                    switch(usuario.rol) {
                        case 'master':
                        case 'admin':
                            window.location.href = '/admin/dashboard.html';
                            break;
                        case 'entregador':
                            window.location.href = '/delivery/dashboard.html';
                            break;
                        case 'cliente':
                        default:
                            window.location.href = '/tienda/index.html';
                    }
                }
            } else {
                // Token inválido, limpiar localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            }
        } catch (error) {
            // Error al verificar el token, limpiar localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    // Aquí tu lógica para enviar al backend...
});

// Registro
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = this.nombre.value;
    const email = this.email.value;
    const telefono = this.telefono.value;
    const direccion = this.direccion.value;
    const password = this.password.value;
    // Aquí tu lógica para enviar al backend...
});