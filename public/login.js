const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Animaciones del formulario
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

// Manejo del formulario de login
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');

// API Base URL
const API_BASE = '/api/auth';

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${tipo}`;
    messageDiv.textContent = mensaje;
    
    // Estilos del mensaje
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Colores según el tipo
    switch(tipo) {
        case 'success':
            messageDiv.style.background = '#4CAF50';
            break;
        case 'error':
            messageDiv.style.background = '#f44336';
            break;
        default:
            messageDiv.style.background = '#2196F3';
    }
    
    document.body.appendChild(messageDiv);
    
    // Eliminar mensaje después de 4 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 4000);
}

// CSS para animaciones de mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .form-loading {
        opacity: 0.7;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

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
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.body || 'Error en la petición');
        }
        
        return result;
    } catch (error) {
        throw error;
    }
}

// Manejar envío del formulario de login
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
    this.classList.add('form-loading');
    
    try {
        const response = await apiRequest('/login', 'POST', { email, password });
        
        // Guardar token en localStorage
        localStorage.setItem('token', response.body.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.body.data.usuario));
        
        mostrarMensaje('¡Login exitoso! Redirigiendo...', 'success');
        
        // Redireccionar según el rol
        setTimeout(() => {
            const usuario = response.body.data.usuario;
            switch(usuario.rol) {
                case 'master':
                case 'admin':
                    window.location.href = '/admin/dashboard.html';
                    break;
                case 'entregador':
                    window.location.href = '/delivery/dashboard.html';
                    break;
                default:
                    window.location.href = '/tienda/index.html';
            }
        }, 1500);
        
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    } finally {
        // Restaurar estado del botón
        submitBtn.textContent = originalText;
        this.classList.remove('form-loading');
    }
});

// Manejar envío del formulario de registro
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = this.querySelector('input[placeholder="Nombre de usuario"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    if (!nombre || !email || !password) {
        mostrarMensaje('Por favor, complete todos los campos', 'error');
        return;
    }
    
    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensaje('Por favor, ingrese un email válido', 'error');
        return;
    }
    
    // Validar contraseña (mínimo 4 caracteres)
    if (password.length < 4) {
        mostrarMensaje('La contraseña debe tener al menos 4 caracteres', 'error');
        return;
    }
    
    // Mostrar estado de carga
    const submitBtn = this.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registrando...';
    this.classList.add('form-loading');
    
    try {
        const response = await apiRequest('/register', 'POST', {
            nombre,
            email,
            password
        });
        
        mostrarMensaje('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');
        
        // Limpiar formulario
        this.reset();
        
        // Cambiar a formulario de login después de 2 segundos
        setTimeout(() => {
            container.classList.remove('active');
        }, 2000);
        
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    } finally {
        // Restaurar estado del botón
        submitBtn.textContent = originalText;
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
                const result = await response.json();
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
                    default:
                        window.location.href = '/tienda/index.html';
                }
            } else {
                // Token inválido, limpiar localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            }
        } catch (error) {
            console.log('Error verificando token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
    }
});