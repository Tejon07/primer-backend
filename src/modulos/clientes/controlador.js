const db = require('../../DB/mysql');
const TABLA = 'usuarios'; // Cambié a 'usuarios'

async function todos() {
    try {
        return await db.todos(TABLA);
    } catch (error) {
        console.error('Error en controlador.todos:', error);
        throw error;
    }
}

async function uno(id) {
    try {
        if (!id) {
            throw new Error('ID es requerido');
        }
        return await db.uno(TABLA, id);
    } catch (error) {
        console.error('Error en controlador.uno:', error);
        throw error;
    }
}

async function agregar(data) {
    try {
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Datos son requeridos');
        }
        
        // Validar campos requeridos para usuarios
        if (!data.nombre || !data.apellido || !data.nombre_usuario || !data.correo || !data.clave) {
            throw new Error('Faltan campos requeridos: nombre, apellido, nombre_usuario, correo, clave');
        }
        
        // Agregar fecha_registro automáticamente
        data.fecha_registro = new Date();
        
        return await db.agregar(TABLA, data);
    } catch (error) {
        console.error('Error en controlador.agregar:', error);
        throw error;
    }
}

async function eliminar(id) {
    try {
        if (!id) {
            throw new Error('ID es requerido');
        }
        return await db.eliminar(TABLA, id);
    } catch (error) {
        console.error('Error en controlador.eliminar:', error);
        throw error;
    }
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
}