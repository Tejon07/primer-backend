const mysql = require('mysql');
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
            setTimeout(conMysql, 200)
        }else{
            console.log('Base de Datos conectada!');
        }
    })
}

conexion.on('error', err => {
    console.log('[db error]', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST'){
        conMysql();
    }else{
        throw err;
    }
})

function todos (tabla){
    return prueba; 
}

function uno (tabla, id){

}

function agregar (tabla, data){

}

function eliminar (tabla, id){

}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
}