const express = require('express');
const router = express.Router();
const { 
  obtenerAlergenos, 
  crearAlergeno, 
  obtenerAlergenoPorId, 
  actualizarAlergeno, 
  eliminarAlergeno 
} = require('../controllers/alergenoController');

// Rutas para alérgenos
router.get('/', obtenerAlergenos);
router.post('/', crearAlergeno);
router.get('/:id', obtenerAlergenoPorId);
router.put('/:id', actualizarAlergeno);
router.delete('/:id', eliminarAlergeno);

module.exports = router;
