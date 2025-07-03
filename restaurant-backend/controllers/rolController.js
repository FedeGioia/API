const Roles = require('../models/Rol');
const { body, validationResult } = require('express-validator');

const listar = async (req, res) => {
  try {
    const roles = await Roles.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los roles' });
  }
};

const crear = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nombre } = req.body;
    
    // Verificar si ya existe un rol con ese nombre
    const rolExistente = await Roles.findOne({ where: { nombre } });
    if (rolExistente) {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    }

    const nuevoRol = await Roles.create({ nombre });
    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ error: 'Error al crear el rol' });
  }
};

const modificar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const rol = await Roles.findByPk(id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Verificar si ya existe otro rol con ese nombre
    const rolExistente = await Roles.findOne({ 
      where: { 
        nombre,
        id: { [require('sequelize').Op.ne]: id }
      }
    });
    if (rolExistente) {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    }

    await rol.update({ nombre });
    res.json(rol);
  } catch (error) {
    console.error('Error al modificar rol:', error);
    res.status(500).json({ error: 'Error al modificar el rol' });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Roles.findByPk(id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Verificar si hay usuarios usando este rol
    const Usuario = require('../models/Usuario');
    const usuariosConRol = await Usuario.count({ where: { rol_id: id } });
    if (usuariosConRol > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar el rol porque hay ${usuariosConRol} usuario(s) asignado(s)` 
      });
    }

    await rol.destroy();
    res.json({ mensaje: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ error: 'Error al eliminar el rol' });
  }
};

// Validaciones para roles
const validateRol = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre del rol es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre del rol debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre del rol solo puede contener letras y espacios')
];

module.exports = { 
  listar, 
  crear, 
  modificar, 
  eliminar, 
  validateRol 
};