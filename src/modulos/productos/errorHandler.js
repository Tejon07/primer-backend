// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  // Error de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_NO_SUCH_TABLE':
        return res.status(500).json({
          success: false,
          message: 'Tabla de base de datos no encontrada',
          error: 'Database table not found'
        });
      case 'ER_DUP_ENTRY':
        return res.status(400).json({
          success: false,
          message: 'Entrada duplicada',
          error: 'Duplicate entry'
        });
      case 'ECONNREFUSED':
        return res.status(500).json({
          success: false,
          message: 'No se puede conectar a la base de datos',
          error: 'Database connection refused'
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Error de base de datos',
          error: err.message
        });
    }
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal server error'
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = { errorHandler, notFound };