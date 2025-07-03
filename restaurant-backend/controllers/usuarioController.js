const Usuario = require('../models/Usuario');
const Roles = require('../models/Rol');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ 
      where: { eliminado: false },
      include: [{ model: Roles, as: 'rol', attributes: ['id', 'nombre'] }]
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: { id: req.params.id, eliminado: false },
      include: [{ model: Roles, as: 'rol', attributes: ['id', 'nombre'] }]
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

function requireAdmin(req, res, next) {
  if (req.user && req.user.rol === 1) return next();
  return res.status(403).json({ error: 'Solo administradores pueden realizar esta acción' });
}

// Función para validar que el rol existe
async function validateRolExists(req, res, next) {
  if (req.body.rol_id) {
    try {
      const rol = await Roles.findByPk(req.body.rol_id);
      if (!rol) {
        return res.status(400).json({ error: 'El rol especificado no existe' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Error al validar el rol' });
    }
  }
  next();
}

exports.validateUsuario = [
  body('nombre_usuario').notEmpty().withMessage('El nombre de usuario es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol_id').optional().isInt({ min: 1 }).withMessage('El rol_id debe ser un número entero válido'),
];

exports.crear = [requireAdmin, exports.validateUsuario, validateRolExists, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const usuario = await Usuario.create({ ...req.body, password: hash });
    
    // Devolver el usuario con su rol
    const usuarioConRol = await Usuario.findByPk(usuario.id, {
      include: [{ model: Roles, as: 'rol', attributes: ['id', 'nombre'] }]
    });
    
    res.status(201).json(usuarioConRol);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear usuario' });
  }
}];

exports.modificar = [requireAdmin, exports.validateUsuario, validateRolExists, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario || usuario.eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    // Si se está modificando la contraseña, hashearla
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    
    await usuario.update(req.body);
    
    // Devolver el usuario actualizado con su rol
    const usuarioActualizado = await Usuario.findByPk(usuario.id, {
      include: [{ model: Roles, as: 'rol', attributes: ['id', 'nombre'] }]
    });
    
    res.json(usuarioActualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al modificar usuario' });
  }
}];

exports.eliminar = [requireAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario || usuario.eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
    await usuario.update({ eliminado: true, eliminado_por: req.user.nombre_usuario });
    res.json({ mensaje: 'Usuario eliminado lógicamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}];

exports.login = async (req, res) => {
  try {
    console.log('Body recibido:', req.body);
    const usuario = await Usuario.findOne({ where: { nombre_usuario: req.body.nombre_usuario } });
    if (!usuario || usuario.eliminado) {
      console.log('Usuario no encontrado o eliminado');
      return res.status(401).json({ error: 'Credenciales inválidas 1' });
    }

    const match = await bcrypt.compare(req.body.password, usuario.password);
    if (!match) {
      console.log('Password incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas 2' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre_usuario: usuario.nombre_usuario, rol: usuario.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user:{nombre_usuario:usuario.nombre_usuario, rol: usuario.rol_id, id: usuario.id} });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
};

exports.obtenerCrecimiento = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const db = require('../config/db');
    
    // Obtener usuarios creados por mes en los últimos 6 meses
    const crecimiento = await Usuario.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_creacion'), '%Y-%m'), 'mes'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']
      ],
      where: {
        eliminado: false,
        fecha_creacion: {
          [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(NOW(), INTERVAL 6 MONTH)")
        }
      },
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_creacion'), '%Y-%m')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_creacion'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // Formatear los datos para el gráfico
    const datosFormateados = crecimiento.map(item => ({
      mes: item.mes,
      usuarios: parseInt(item.cantidad)
    }));

    res.json(datosFormateados);
  } catch (err) {
    console.error('Error al obtener crecimiento de usuarios:', err);
    res.status(500).json({ error: 'Error al obtener datos de crecimiento' });
  }
};
