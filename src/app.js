const express = require('express');
const path = require('path');
const config = require('./config');

// Importar módulos
const usuarios = require('./modulos/clientes/rutas');
const auth = require('./modulos/auth/rutas');

const app = express();

// Configuración
app.set('port', config.app.port);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
app.use('/api/usuarios', usuarios);
app.use('/api/auth', auth);

// Ruta raíz - servir la página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Ruta para páginas específicas (opcional)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores 404 - IMPORTANTE: esto debe ir al final
app.use((req, res) => {
    // Si es una petición a la API, devolver JSON
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            error: true,
            mensaje: 'Ruta de API no encontrada'
        });
    } else {
        // Si es una página, redirigir al login
        res.redirect('/');
    }
});

module.exports = app;