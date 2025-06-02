const db = require('../../DB/mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TABLA = 'usuarios';

// Configuración JWT - IMPORTANTE: Configurar JWT_SECRET en producción
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Validar que JWT_SECRET esté configurado
if (!JWT_SECRET) {
    console.error('ERROR CRÍTICO: JWT_SECRET no está configurado en las variables de entorno');
    process.exit(1);
}

// Límite de intentos de login (básico)
const intentosLogin = new Map();
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO = 15 * 60 * 1000; // 15 minutos

function limpiarIntentosViejos() {
    const ahora = Date.now();
    for (const [email, data] of intentosLogin.entries()) {
        if (ahora - data.ultimoIntento > TIEMPO_BLOQUEO) {
            intentosLogin.delete(email);
        }
    }
}

async function login(email, password) {
    try {
        console.log('Intento de login para:', email);
        
        // Validaciones de entrada
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }

        // Normalizar email
        const emailNormalizado = email.toLowerCase().trim();

        // Verificar límite de intentos
        limpiarIntentosViejos();
        const intentos = intentosLogin.get(emailNormalizado);
        
        if (intentos && intentos.count >= MAX_INTENTOS) {
            const tiempoRestante = Math.ceil((TIEMPO_BLOQUEO - (Date.now() - intentos.ultimoIntento)) / 60000);
            throw new Error(`Demasiados intentos fallidos. Intente nuevamente en ${tiempoRestante} minutos`);
        }

        // Buscar usuario por email con su rol usando la función query del módulo mysql
        const query = `
            SELECT u.id, u.nombre, u.email, u.password, u.telefono, u.direccion, u.activo, 
                   r.nombre as rol_nombre, r.permisos 
            FROM usuarios u 
            LEFT JOIN roles r ON u.rol_id = r.id 
            WHERE u.email = ? AND u.activo = 1
        `;
        
        const usuarios = await db.query(query, [emailNormalizado]);
        const usuario = usuarios[0];

        if (!usuario) {
            // Registrar intento fallido
            registrarIntentoFallido(emailNormalizado);
            console.log('Usuario no encontrado o inactivo para email:', emailNormalizado);
            throw new Error('Credenciales incorrectas');
        }

        console.log('Usuario encontrado:', usuario.nombre, 'Activo:', usuario.activo);

        // Verificar contraseña
        let passwordValida = false;
        
        try {
            // Si la contraseña en BD comienza con $2b$, es un hash bcrypt
            if (usuario.password && usuario.password.startsWith('$2b$')) {
                passwordValida = await bcrypt.compare(password, usuario.password);
                console.log('Verificación bcrypt completada');
            } else {
                // Comparación de texto plano (para compatibilidad temporal)
                // NOTA: En producción, todas las contraseñas deberían estar hasheadas
                passwordValida = password === usuario.password;
                console.log('Verificación texto plano (DEPRECADO)');
                
                // Opcional: Actualizar contraseña a hash si es válida
                if (passwordValida) {
                    await actualizarPasswordAHash(usuario.id, password);
                }
            }
        } catch (error) {
            console.error('Error en verificación de contraseña:', error);
            passwordValida = false;
        }
        
        if (!passwordValida) {
            registrarIntentoFallido(emailNormalizado);
            console.log('Contraseña incorrecta para:', emailNormalizado);
            throw new Error('Credenciales incorrectas');
        }

        // Login exitoso - limpiar intentos fallidos
        intentosLogin.delete(emailNormalizado);

        // Preparar permisos
        let permisos = {};
        try {
            if (usuario.permisos) {
                permisos = JSON.parse(usuario.permisos);
            }
        } catch (error) {
            console.error('Error al parsear permisos:', error);
            permisos = {};
        }

        // Generar token JWT
        const tokenPayload = {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol_nombre || 'cliente',
            permisos: permisos
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { 
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'ecommerce-app',
            audience: 'ecommerce-users'
        });

        console.log('Login exitoso para:', emailNormalizado, 'Rol:', usuario.rol_nombre);

        // Registrar último login (opcional)
        await db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]);

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
                permisos: permisos
            }
        };

    } catch (error) {
        console.error('Error completo en login:', error);
        throw error;
    }
}

function registrarIntentoFallido(email) {
    const intentos = intentosLogin.get(email) || { count: 0, ultimoIntento: 0 };
    intentos.count++;
    intentos.ultimoIntento = Date.now();
    intentosLogin.set(email, intentos);
}

async function actualizarPasswordAHash(userId, password) {
    try {
        const saltRounds = 12; // Incrementado para mayor seguridad
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, userId]);
        console.log('Contraseña actualizada a hash para usuario ID:', userId);
    } catch (error) {
        console.error('Error al actualizar contraseña a hash:', error);
    }
}

async function register(data) {
    try {
        const { nombre, email, password, telefono, direccion } = data;

        // Validaciones mejoradas
        if (!nombre || !email || !password) {
            throw new Error('Nombre, email y contraseña son requeridos');
        }

        // Validar formato de email más estricto
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
            throw new Error('Formato de email inválido');
        }

        // Validar contraseña más estricta
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Validar que la contraseña tenga al menos una letra y un número
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error('La contraseña debe contener al menos una letra y un número');
        }

        // Validar longitud del nombre
        if (nombre.length < 2 || nombre.length > 100) {
            throw new Error('El nombre debe tener entre 2 y 100 caracteres');
        }

        const emailNormalizado = email.toLowerCase().trim();

        // Verificar si el email ya existe usando la función query
        const usuariosExistentes = await db.query('SELECT id FROM usuarios WHERE email = ?', [emailNormalizado]);
        
        if (usuariosExistentes.length > 0) {
            throw new Error('El email ya está registrado');
        }

        // Hashear contraseña con salt rounds más alto
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear nuevo usuario con rol de cliente
        const nuevoUsuario = {
            nombre: nombre.trim(),
            email: emailNormalizado,
            password: hashedPassword,
            telefono: telefono ? telefono.trim() : null,
            direccion: direccion ? direccion.trim() : null,
            rol_id: 7, // Cliente por defecto - considerar hacer esto configurable
            activo: 1,
            created_at: new Date()
        };

        console.log('Creando usuario:', { ...nuevoUsuario, password: '[HIDDEN]' });

        // Usar la función agregar del módulo mysql
        const resultado = await db.agregar('usuarios', nuevoUsuario);

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
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'ecommerce-app',
            audience: 'ecommerce-users'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        } else {
            throw new Error('Error al verificar token');
        }
    }
}

// Middleware para verificar autenticación mejorado
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
        
        if (!token) {
            return res.status(401).json({
                error: true,
                mensaje: 'Token vacío'
            });
        }

        const decoded = verificarToken(token);
        req.usuario = decoded;
        next();
    } catch (error) {
        let mensaje = 'Token inválido';
        let codigo = 401;
        
        if (error.message === 'Token expirado') {
            mensaje = 'Sesión expirada. Por favor, inicie sesión nuevamente';
            codigo = 401;
        }
        
        return res.status(codigo).json({
            error: true,
            mensaje: mensaje
        });
    }
}

// Middleware para verificar permisos mejorado
function verificarPermiso(recurso, accion) {
    return (req, res, next) => {
        try {
            const { permisos, rol } = req.usuario;
            
            // Si es admin o master, permitir todo
            if (rol === 'admin' || rol === 'master') {
                return next();
            }
            
            // Verificar permisos específicos
            if (!permisos || typeof permisos !== 'object') {
                return res.status(403).json({
                    error: true,
                    mensaje: 'Sin permisos configurados'
                });
            }
            
            if (!permisos[recurso] || !Array.isArray(permisos[recurso]) || !permisos[recurso].includes(accion)) {
                return res.status(403).json({
                    error: true,
                    mensaje: `No tienes permisos para ${accion} en ${recurso}`
                });
            }
            
            next();
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            return res.status(403).json({
                error: true,
                mensaje: 'Error al verificar permisos'
            });
        }
    };
}

// Función para refrescar token
async function refrescarToken(req, res, next) {
    try {
        const { usuario } = req;
        
        // Verificar que el usuario aún esté activo en la base de datos
        const usuarioActual = await db.uno('usuarios', usuario.id);
        
        if (!usuarioActual || !usuarioActual.activo) {
            return res.status(401).json({
                error: true,
                mensaje: 'Usuario inactivo'
            });
        }
        
        // Generar nuevo token
        const tokenPayload = {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            permisos: usuario.permisos
        };

        const nuevoToken = jwt.sign(tokenPayload, JWT_SECRET, { 
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'ecommerce-app',
            audience: 'ecommerce-users'
        });
        
        res.json({
            error: false,
            token: nuevoToken,
            mensaje: 'Token renovado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al refrescar token:', error);
        res.status(500).json({
            error: true,
            mensaje: 'Error al refrescar token'
        });
    }
}

module.exports = {
    login,
    register,
    verificarToken,
    autenticar,
    verificarPermiso,
    refrescarToken
};