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

module.exports = router;