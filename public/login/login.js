// login.js - Versión corregida

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const loginForm = document.querySelector('.form-box.login form');
    const registerForm = document.querySelector('.form-box.register form');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');

    // Alternar vistas
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });

    // ✅ CORRECCIÓN: Rutas de API corregidas
    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = loginForm.querySelector('input[type="text"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value.trim();

        if (!username || !password) {
            showMessage('Por favor, completa todos los campos para iniciar sesión.', 'error');
            return;
        }

        try {
            // ✅ Ruta corregida: /api/auth/login
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: username, // El backend espera 'email'
                    password: password 
                })
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                // ✅ Estructura de respuesta corregida
                const { token, usuario } = data.body.data;
                
                // Guardar token (sin localStorage por restricciones de Claude)
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('usuario', JSON.stringify(usuario));
                
                showMessage('¡Login exitoso! Redirigiendo...', 'success');
                
                // ✅ Redirigir a la página de productos
                setTimeout(() => {
                    window.location.href = '/productos';
                }, 1500);
            } else {
                showMessage(data.body || 'Error al iniciar sesión. Verifica tus credenciales.', 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            showMessage('Error de conexión. Intenta de nuevo más tarde.', 'error');
        }
    });

    // Registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = registerForm.querySelector('input[placeholder="Nombre de usuario"]').value.trim();
        const email = registerForm.querySelector('input[type="email"]').value.trim();
        const password = registerForm.querySelector('input[type="password"]').value.trim();

        if (!username || !email || !password) {
            showMessage('Por favor, completa todos los campos para registrarte.', 'error');
            return;
        }

        // ✅ Validaciones adicionales
        if (password.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Por favor, ingresa un email válido.', 'error');
            return;
        }

        try {
            // ✅ Ruta corregida: /api/auth/register
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    nombre: username,
                    email: email, 
                    password: password 
                })
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                showMessage('¡Registro exitoso! Ya puedes iniciar sesión.', 'success');
                container.classList.remove('active');
                
                // Limpiar formulario
                registerForm.reset();
            } else {
                showMessage(data.body || 'Error al registrarse. Verifica tus datos.', 'error');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            showMessage('Error de conexión. Intenta de nuevo más tarde.', 'error');
        }
    });

    // ✅ NUEVAS FUNCIONES DE UTILIDAD
    function showMessage(message, type = 'info') {
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Estilos del mensaje
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Colores según tipo
        switch(type) {
            case 'success':
                messageDiv.style.backgroundColor = '#10b981';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#ef4444';
                break;
            default:
                messageDiv.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(messageDiv);
        
        // Animar entrada
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 4000);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ✅ Verificar si ya está logueado
    const token = sessionStorage.getItem('token');
    if (token) {
        // Verificar si el token es válido
        fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                // Usuario ya logueado, redirigir
                window.location.href = '/productos';
            }
        })
        .catch(() => {
            // Token inválido, limpiar storage
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('usuario');
        });
    }
});