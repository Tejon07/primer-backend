const express = require('express');

const respuesta = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

router.get('/', function (req, res){
    const todos = contolador.todos();
    respuesta.success(req, res, 'Todo Ok desde clientes', 200)
});

module.exports = router;