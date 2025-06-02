const express = require('express');

const respuesta = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

router.get('/', async function (req, res) {
    try {
        const todos = await controlador.todos();
        respuesta.success(req, res, todos, 200);
    } catch (error) {
        respuesta.error(req, res, error.message, 500);
    }
});

router.get('/:id', async function (req, res) {
    try {
        const item = await controlador.uno(req.params.id);
        respuesta.success(req, res, item, 200);
    } catch (error) {
        respuesta.error(req, res, error.message, 500);
    }
});

router.post('/', async function (req, res) {
    try {
        const resultado = await controlador.agregar(req.body);
        respuesta.success(req, res, 'Item agregado correctamente', 201);
    } catch (error) {
        respuesta.error(req, res, error.message, 500);
    }
});

router.delete('/:id', async function (req, res) {
    try {
        await controlador.eliminar(req.params.id);
        respuesta.success(req, res, 'Item eliminado correctamente', 200);
    } catch (error) {
        respuesta.error(req, res, error.message, 500);
    }
});

module.exports = router;