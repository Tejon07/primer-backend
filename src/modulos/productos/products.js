const { pool } = require('../../config');

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.category = data.category;
    this.image = data.image;
    this.description = data.description;
    this.stock = data.stock;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Obtener todos los productos
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products ORDER BY created_at DESC'
      );
      return rows.map(row => new Product(row));
    } catch (error) {
      throw new Error(`Error obteniendo productos: ${error.message}`);
    }
  }

  // Obtener productos por categoría
  static async getByCategory(category) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC',
        [category]
      );
      return rows.map(row => new Product(row));
    } catch (error) {
      throw new Error(`Error obteniendo productos por categoría: ${error.message}`);
    }
  }

  // Obtener producto por ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Product(rows[0]);
    } catch (error) {
      throw new Error(`Error obteniendo producto: ${error.message}`);
    }
  }

  // Crear nuevo producto
  static async create(productData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO products (name, price, category, image, description, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [
          productData.name,
          productData.price,
          productData.category,
          productData.image,
          productData.description || '',
          productData.stock || 0
        ]
      );
      
      return await Product.getById(result.insertId);
    } catch (error) {
      throw new Error(`Error creando producto: ${error.message}`);
    }
  }

  // Actualizar producto
  static async update(id, productData) {
    try {
      await pool.execute(
        'UPDATE products SET name = ?, price = ?, category = ?, image = ?, description = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [
          productData.name,
          productData.price,
          productData.category,
          productData.image,
          productData.description,
          productData.stock,
          id
        ]
      );
      
      return await Product.getById(id);
    } catch (error) {
      throw new Error(`Error actualizando producto: ${error.message}`);
    }
  }

  // Eliminar producto
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error eliminando producto: ${error.message}`);
    }
  }

  // Buscar productos
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY name',
        [searchTerm, searchTerm]
      );
      return rows.map(row => new Product(row));
    } catch (error) {
      throw new Error(`Error buscando productos: ${error.message}`);
    }
  }
}

module.exports = Product;