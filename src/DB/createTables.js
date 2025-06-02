const { pool } = require('../config');

const createProductsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      category ENUM('abrigos', 'pantalones', 'accesorios') NOT NULL,
      image VARCHAR(500) NOT NULL,
      description TEXT,
      stock INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_name (name),
      FULLTEXT(name, description)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.execute(createTableQuery);
    console.log('✅ Tabla products creada exitosamente');
  } catch (error) {
    console.error('❌ Error creando tabla products:', error.message);
    throw error;
  }
};

const createTables = async () => {
  try {
    await createProductsTable();
    console.log('🎉 Todas las tablas creadas exitosamente');
  } catch (error) {
    console.error('💥 Error creando tablas:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  createTables().then(() => {
    process.exit(0);
  });
}

module.exports = { createTables, createProductsTable };