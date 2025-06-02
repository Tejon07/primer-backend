const db = require('../../DB/mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TABLA = 'usuarios';

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_cambiar_en_produccion';
const JWT_EXPIRES_IN = '24h';

async function login(email, password) {
    try {
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }

        // Buscar usuario por email con su rol
        const query = `
            SELECT u.id, u.nombre, u.email, u.password, u.activo, 
                   r.nombre as rol_nombre, r.permisos 
            FROM usuarios u 
            LEFT JOIN roles r ON u.rol_id = r.id 
            WHERE u.email = ?
        `;
        
        const usuario = await new Promise((resolve, reject) => {
            db.conexion.query(query, [email], (error, results) => {
                if (error) return reject(error);
                resolve(results[0]);
            });
        });

        if (!usuario) {
            throw new Error('Credenciales incorrectas');
        }

        if (!usuario.activo) {
            throw new Error('Usuario inactivo. Contacte al administrador');
        }

        // Verificar contraseña
        // CAMBIO: Manejo mejorado de contraseñas hasheadas y texto plano
        let passwordValida = false;
        
        try {
            // Intentar verificar como hash bcrypt
            passwordValida = await bcrypt.compare(password, usuario.password);
        } catch (error) {
            // Si falla, comparar como texto plano (para compatibilidad)
            passwordValida = password === usuario.password;
        }
        
        if (!passwordValida) {
            throw new Error('Credenciales incorrectas');
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol_nombre,
                permisos: usuario.permisos ? JSON.parse(usuario.permisos) : {}
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Retornar datos del usuario sin la contraseña
        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol_nombre,
                permisos: usuario.permisos ? JSON.parse(usuario.permisos) : {}
            }
        };

    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

async function register(data) {
    try {
        const { nombre, email, password, telefono, direccion } = data;

        if (!nombre || !email || !password) {
            throw new Error('Nombre, email y contraseña son requeridos');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Formato de email inválido');
        }

        // Validar longitud de contraseña
        if (password.length < 4) {
            throw new Error('La contraseña debe tener al menos 4 caracteres');
        }

        // Verificar si el email ya existe
        const usuarioExistente = await new Promise((resolve, reject) => {
            db.conexion.query('SELECT id FROM usuarios WHERE email = ?', [email], (error, results) => {
                if (error) return reject(error);
                resolve(results[0]);
            });
        });

        if (usuarioExistente) {
            throw new Error('El email ya está registrado');
        }

        // Hashear contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear nuevo usuario con rol de cliente (id 7)
        const nuevoUsuario = {
            nombre,
            email,
            password: hashedPassword,
            telefono: telefono || null,
            direccion: direccion || null,
            rol_id: 7, // Cliente por defecto
            activo: 1,
            created_at: new Date()
        };

        const resultado = await new Promise((resolve, reject) => {
            db.conexion.query('INSERT INTO usuarios SET ?', nuevoUsuario, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        return {
            id: resultado.insertId,
            mensaje: 'Usuario registrado exitosamente'
        };

    } catch (error) {
        console.error('Error en register:', error);
        throw error;
    }
}

function verificarToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido');
    }
}

// Middleware para verificar autenticación
function autenticar(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: true,
                mensaje: 'Token no proporcionado o formato incorrecto'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verificarToken(token);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            mensaje: 'Token inválido'
        });
    }
}

// Middleware para verificar permisos
function verificarPermiso(recurso, accion) {
    return (req, res, next) => {
        try {
            const { permisos, rol } = req.usuario;
            
            // Si es admin o master, permitir todo
            if (rol === 'admin' || rol === 'master') {
                return next();
            }
            
            if (!permisos || !permisos[recurso] || !permisos[recurso].includes(accion)) {
                return res.status(403).json({
                    error: true,
                    mensaje: 'No tienes permisos para realizar esta acción'
                });
            }
            
            next();
        } catch (error) {
            return res.status(403).json({
                error: true,
                mensaje: 'Error al verificar permisos'
            });
        }
    };
}

module.exports = {
    login,
    register,
    verificarToken,
    autenticar,
    verificarPermiso
};