const express = require('express');
const path = require('path');
const config = require('./config');

// Importar módulos
const usuarios = require('./modulos/clientes/rutas');
const auth = require('./modulos/auth/rutas'); // Nuevo módulo de autenticación

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
app.use('/api/auth', auth); // Rutas de autenticación

// Ruta raíz - servir la página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: true,
        mensaje: 'Ruta no encontrada'
    });
});

module.exports = app;