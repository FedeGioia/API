const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rolController = require('../controllers/rolController');

// Middleware para verificar que sea admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.rol === 1) return next();
  return res.status(403).json({ error: 'Solo administradores pueden realizar esta acción' });
}

// Rutas de roles
router.get('/', rolController.listar); // Listar roles (público para el frontend)
router.post('/', auth.verifyToken, requireAdmin, rolController.validateRol, rolController.crear);
router.put('/:id', auth.verifyToken, requireAdmin, rolController.validateRol, rolController.modificar);
router.delete('/:id', auth.verifyToken, requireAdmin, rolController.eliminar);

module.exports = router;