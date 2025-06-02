// Función para hacer peticiones a la API - CORREGIDA
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
        
        // AGREGADO: Verificar si la respuesta tiene contenido
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

// Manejar envío del formulario de login - CORREGIDO
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
        
        // CORREGIDO: Estructura correcta según respuestas.js
        console.log('Respuesta completa:', response); // Para debug
        
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

// Verificar si ya hay una sesión activa al cargar la página - CORREGIDO
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            // CORREGIDO: Usar fetch directamente para mejor control de errores
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
            console.log('Error verificando token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
    }
});