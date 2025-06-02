const db = require('../../DB/mysql');
const TABLA = 'producto';

function todos () {
    return db.todos(TABLA);
}

module.exports = {
    todos,
}