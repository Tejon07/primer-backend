const express = require('express');
const config = require('./config');

const usuarios = require('./modulos/clientes/rutas'); // Reutilizamos el módulo

const app = express();

// Configuración
app.set('port', config.app.port);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas - CAMBIO: /api/usuarios en lugar de /api/clientes
app.use('/api/usuarios', usuarios);

module.exports = app;