const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const auth = require('../middleware/auth');

// Rutas para categorías
router.get('/categorias', categoriaController.listarCategorias);
router.get('/categorias/:id', categoriaController.obtenerCategoria);
router.post('/categorias', auth.verifyToken, categoriaController.requireAdmin, categoriaController.validateCategoria, categoriaController.crearCategoria);
router.put('/categorias/:id', auth.verifyToken, categoriaController.requireAdmin, categoriaController.validateCategoria, categoriaController.modificarCategoria);
router.delete('/categorias/:id', auth.verifyToken, categoriaController.requireAdmin, categoriaController.eliminarCategoria);

// Rutas para subcategorías
router.get('/subcategorias', categoriaController.listarSubcategorias);
router.get('/subcategorias/:id', categoriaController.obtenerSubcategoria);
router.post('/subcategorias', auth.verifyToken, categoriaController.requireAdmin, categoriaController.validateSubcategoria, categoriaController.crearSubcategoria);
router.put('/subcategorias/:id', auth.verifyToken, categoriaController.requireAdmin, categoriaController.validateSubcategoria, categoriaController.modificarSubcategoria);
router.delete('/subcategorias/:id', auth.verifyToken, categoriaController.requireAdmin, categoriaController.eliminarSubcategoria);

module.exports = router;