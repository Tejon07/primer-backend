const db = require('../../DB/mysql');
const TABLA = 'producto'; // O cambiar a 'clientes' según corresponda

async function todos() {
    try {
        return await db.todos(TABLA);
    } catch (error) {
        throw error;
    }
}

async function uno(id) {
    try {
        return await db.uno(TABLA, id);
    } catch (error) {
        throw error;
    }
}

async function agregar(data) {
    try {
        return await db.agregar(TABLA, data);
    } catch (error) {
        throw error;
    }
}

async function eliminar(id) {
    try {
        return await db.eliminar(TABLA, id);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
}