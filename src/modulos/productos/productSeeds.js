const { pool } = require('../../config');
const { createTables } = require('../../DB/createTables');

const sampleProducts = [
  {
    name: 'Abrigo Largo Elegante',
    price: 140.00,
    category: 'abrigos',
    image: '../../../imagenes para tienda/1.jpeg',
    description: 'Abrigo largo elegante para el invierno, confeccionado con materiales de alta calidad.',
    stock: 10
  },
  {
    name: 'Chaqueta de Cuero Premium',
    price: 210.00,
    category: 'abrigos',
    image: '../../../imagenes para tienda/2.jpeg',
    description: 'Chaqueta de cuero genuino con estilo clásico y moderno.',
    stock: 5
  },
  {
    name: 'Abrigo Deportivo',
    price: 95.00,
    category: 'abrigos',
    image: '../../../imagenes para tienda/3.jpeg',
    description: 'Abrigo deportivo cómodo y funcional.',
    stock: 8
  },
  {
    name: 'Jeans Azul Clásico',
    price: 130.00,
    category: 'pantalones',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
    description: 'Jeans azul clásico de corte regular, perfecto para el uso diario.',
    stock: 15
  },
  {
    name: 'Pantalón Deportivo Pro',
    price: 100.00,
    category: 'pantalones',
    image: '../../../imagenes para tienda/4.jpeg',
    description: 'Pantalón deportivo de alta tecnología para máximo rendimiento.',
    stock: 12
  },
  {
    name: 'Pantalón Formal',
    price: 150.00,
    category: 'pantalones',
    image: '../../../imagenes para tienda/4.jpeg',
    description: 'Pantalón formal elegante para ocasiones especiales.',
    stock: 7
  },
  {
    name: 'Gorra Negra Urban',
    price: 50.00,
    category: 'accesorios',
    image: '12.jpg',
    description: 'Gorra negra de estilo urbano con diseño moderno.',
    stock: 20
  },
  {
    name: 'Reloj Clásico Dorado',
    price: 250.00,
    category: 'accesorios',
    image: '12.jpg',
    description: 'Reloj clásico elegante con acabado dorado y mecanismo de precisión.',
    stock: 3
  },
];

const seedProducts = async () => {
  try {
    console.log('🌱 Iniciando seed de productos...');
    
    // Crear tablas si no existen
    await createTables();
    
    // Limpiar tabla de productos
    await pool.execute('DELETE FROM products');
    console.log('🧹 Tabla products limpiada');
    
    // Insertar productos de prueba
    for (const product of sampleProducts) {
      await pool.execute(
        'INSERT INTO products (name, price, category, image, description, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.price, product.category, product.image, product.description, product.stock]
      );
    }
    
    console.log(`✅ ${sampleProducts.length} productos agregados exitosamente`);
    
    // Mostrar resumen
    const [counts] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(stock) as total_stock
      FROM products 
      GROUP BY category
    `);
    
    console.log('\n📊 Resumen por categoría:');
    counts.forEach(row => {
      console.log(`  ${row.category}: ${row.count} productos, ${row.total_stock} en stock`);
    });
    
  } catch (error) {
    console.error('💥 Error en seed:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('🎉 Seed completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}

module.exports = { seedProducts };