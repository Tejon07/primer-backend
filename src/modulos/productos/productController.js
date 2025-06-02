const Product = require('./products');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener productos por categoría
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validar categoría
    const validCategories = ['abrigos', 'pantalones', 'accesorios'];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida'
      });
    }
    
    const products = await Product.getByCategory(category.toLowerCase());
    res.json({
      success: true,
      data: products,
      category: category,
      count: products.length
    });
  } catch (error) {
    console.error('Error en getProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto no válido'
      });
    }
    
    const product = await Product.getById(parseInt(id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error en getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar productos
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La búsqueda debe tener al menos 2 caracteres'
      });
    }
    
    const products = await Product.search(q.trim());
    res.json({
      success: true,
      data: products,
      query: q,
      count: products.length
    });
  } catch (error) {
    console.error('Error en searchProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear producto (para administración)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, image, description, stock } = req.body;
    
    // Validaciones básicas
    if (!name || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: name, price, category, image'
      });
    }
    
    const productData = {
      name: name.trim(),
      price: parseFloat(price),
      category: category.toLowerCase(),
      image: image.trim(),
      description: description ? description.trim() : '',
      stock: stock ? parseInt(stock) : 0
    };
    
    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};