const mysql = require('mysql2');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
}

let conexion;

function conMysql(){
    conexion = mysql.createConnection(dbconfig);
    conexion.connect((err) => {
        if(err){
            console.log('[db error]', err);
            setTimeout(conMysql, 2000)
        }else{
            console.log('Base de Datos conectada!');
        }
    })

    conexion.on('error', err => {
        console.log('[db error]', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            conMysql();
        }else{
            throw err;
        }
    })
}

// Inicializar conexión
conMysql();

function todos(tabla) {
    return new Promise((resolve, reject) => {
        if (!conexion) {
            return reject(new Error('No hay conexión a la base de datos'));
        }
        conexion.query('SELECT * FROM ??', [tabla], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

// CORREGIDO: Usar 'id' estándar como en tu base de datos
function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        if (!conexion) {
            return reject(new Error('No hay conexión a la base de datos'));
        }
        conexion.query('SELECT * FROM ?? WHERE id = ?', [tabla, id], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
}

function agregar(tabla, data) {
    return new Promise((resolve, reject) => {
        if (!conexion) {
            return reject(new Error('No hay conexión a la base de datos'));
        }
        conexion.query('INSERT INTO ?? SET ?', [tabla, data], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

// CORREGIDO: Usar 'id' estándar como en tu base de datos
function eliminar(tabla, id) {
    return new Promise((resolve, reject) => {
        if (!conexion) {
            return reject(new Error('No hay conexión a la base de datos'));
        }
        conexion.query('DELETE FROM ?? WHERE id = ?', [tabla, id], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

// NUEVO: Función para consultas personalizadas
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!conexion) {
            return reject(new Error('No hay conexión a la base de datos'));
        }
        conexion.query(sql, params, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    query,
    conexion // Exportar conexión para el módulo de login
};