const express = require('express');
const router = express.Router();
const productController = require('./productController');

// GET /api/products - Obtener todos los productos
router.get('/', productController.getAllProducts);

// GET /api/products/search - Buscar productos
router.get('/search', productController.searchProducts);

// GET /api/products/category/:category - Obtener productos por categoría
router.get('/category/:category', productController.getProductsByCategory);

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', productController.getProductById);

// POST /api/products - Crear nuevo producto
router.post('/', productController.createProduct);

module.exports = router;
