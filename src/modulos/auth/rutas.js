const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

// Ruta de login
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return respuesta.error(req, res, 'Email y contraseña son requeridos', 400);
        }
        
        const resultado = await controlador.login(email, password);
        
        respuesta.success(req, res, {
            mensaje: 'Login exitoso',
            data: resultado
        }, 200);
    } catch (error) {
        console.error('Error en login:', error);
        respuesta.error(req, res, error.message, 401);
    }
});

// Ruta de registro
router.post('/register', async function (req, res) {
    try {
        const resultado = await controlador.register(req.body);
        respuesta.success(req, res, resultado, 201);
    } catch (error) {
        console.error('Error en register:', error);
        respuesta.error(req, res, error.message, 400);
    }
});

// Verificar token (para validar sesión)
router.get('/verify', async function (req, res) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return respuesta.error(req, res, 'Token no proporcionado', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = controlador.verificarToken(token);
        
        respuesta.success(req, res, {
            valido: true,
            usuario: decoded
        }, 200);
    } catch (error) {
        console.error('Error en verify:', error);
        respuesta.error(req, res, 'Token inválido', 401);
    }
});

// Logout (en el frontend solo eliminar el token)
router.post('/logout', async function (req, res) {
    try {
        // En una implementación más robusta, podrías mantener una lista negra de tokens
        respuesta.success(req, res, { mensaje: 'Logout exitoso' }, 200);
    } catch (error) {
        respuesta.error(req, res, error.message, 500);
    }
});

// Ruta protegida de ejemplo (perfil del usuario)
router.get('/profile', controlador.autenticar, async function (req, res) {
    try {
        respuesta.success(req, res, {
            mensaje: 'Perfil obtenido exitosamente',
            usuario: req.usuario
        }, 200);
    } catch (error) {
        respuesta.error(req, res, error.message, 500);
    }
});
// Agrega esta función a tu archivo de rutas para hacer debug
async function loginHandler(req, res) {
    try {
        console.log('=== DEBUG LOGIN ===');
        console.log('Headers recibidos:', req.headers);
        console.log('Body recibido:', req.body);
        console.log('URL:', req.url);
        console.log('Método:', req.method);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Error: Email o password faltante');
            return res.status(400).json({
                error: true,
                mensaje: 'Email y contraseña son requeridos'
            });
        }
        
        console.log('Intentando login para:', email);
        const resultado = await auth.login(email, password);
        
        console.log('Login exitoso');
        res.json({
            error: false,
            data: resultado,
            mensaje: 'Login exitoso'
        });
        
    } catch (error) {
        console.log('Error en login:', error.message);
        res.status(400).json({
            error: true,
            mensaje: error.message
        });
    }
}


module.exports = router;