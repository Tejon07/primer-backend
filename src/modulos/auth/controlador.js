const db = require('../../DB/mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TABLA = 'usuarios';

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_cambiar_en_produccion';
const JWT_EXPIRES_IN = '24h';

async function login(email, password) {
    try {
        console.log('Intento de login para:', email);
        
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }

        // Buscar usuario por email con su rol
        const query = `
            SELECT u.id, u.nombre, u.email, u.password, u.telefono, u.direccion, u.activo, 
                   r.nombre as rol_nombre, r.permisos 
            FROM usuarios u 
            LEFT JOIN roles r ON u.rol_id = r.id 
            WHERE u.email = ?
        `;
        
        const usuario = await new Promise((resolve, reject) => {
            db.conexion.query(query, [email], (error, results) => {
                if (error) {
                    console.error('Error en query de usuario:', error);
                    return reject(error);
                }
                console.log('Resultados de búsqueda:', results.length);
                resolve(results[0]);
            });
        });

        if (!usuario) {
            console.log('Usuario no encontrado para email:', email);
            throw new Error('Credenciales incorrectas');
        }

        console.log('Usuario encontrado:', usuario.nombre, 'Activo:', usuario.activo);

        if (!usuario.activo) {
            throw new Error('Usuario inactivo. Contacte al administrador');
        }

        // Verificar contraseña
        let passwordValida = false;
        
        // Si la contraseña en BD comienza con $2b$, es un hash bcrypt
        if (usuario.password && usuario.password.startsWith('$2b$')) {
            try {
                passwordValida = await bcrypt.compare(password, usuario.password);
                console.log('Verificación bcrypt:', passwordValida);
            } catch (error) {
                console.error('Error en bcrypt.compare:', error);
                passwordValida = false;
            }
        } else {
            // Comparación de texto plano (para compatibilidad con datos existentes)
            passwordValida = password === usuario.password;
            console.log('Verificación texto plano:', passwordValida);
        }
        
        if (!passwordValida) {
            console.log('Contraseña incorrecta para:', email);
            throw new Error('Credenciales incorrectas');
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol_nombre || 'cliente',
                permisos: usuario.permisos ? JSON.parse(usuario.permisos) : {}
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('Login exitoso para:', email, 'Rol:', usuario.rol_nombre);

        // Retornar datos del usuario sin la contraseña
        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                rol: usuario.rol_nombre || 'cliente',
                permisos: usuario.permisos ? JSON.parse(usuario.permisos) : {}
            }
        };

    } catch (error) {
        console.error('Error completo en login:', error);
        throw error;
    }
}

async function register(data) {
    try {
        const { nombre, email, password, telefono, direccion } = data;

        // Validaciones básicas
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

        // Validar longitud del nombre
        if (nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
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

        // Crear nuevo usuario con rol de cliente (id 7 según la base de datos)
        const nuevoUsuario = {
            nombre: nombre.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            telefono: telefono ? telefono.trim() : null,
            direccion: direccion ? direccion.trim() : null,
            rol_id: 7, // Cliente por defecto
            activo: 1,
            created_at: new Date()
        };

        console.log('Creando usuario:', { ...nuevoUsuario, password: '[HIDDEN]' });

        const resultado = await new Promise((resolve, reject) => {
            db.conexion.query('INSERT INTO usuarios SET ?', nuevoUsuario, (error, results) => {
                if (error) {
                    console.error('Error al insertar usuario:', error);
                    return reject(error);
                }
                resolve(results);
            });
        });

        console.log('Usuario creado exitosamente con ID:', resultado.insertId);

        return {
            id: resultado.insertId,
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: resultado.insertId,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                telefono: nuevoUsuario.telefono,
                direccion: nuevoUsuario.direccion
            }
        };

    } catch (error) {
        console.error('Error en register:', error);
        
        // Manejo específico de errores de MySQL
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('El email ya está registrado');
        }
        
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