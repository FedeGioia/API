const { Plato, Categoria, Subcategoria, Alergeno } = require('../models');
const { body, validationResult } = require('express-validator');

exports.listar = async (req, res) => {
  try {
    const { categoriaId, subcategoriaId } = req.query; // Cambiar nombres según la query
    const where = { eliminado: false };

    // Agrega filtros por categoriaId y subcategoriaId si están presentes en la query
    if (categoriaId) {
      where.categoria_id = categoriaId;
    }
    if (subcategoriaId) {
      where.subcategoria_id = subcategoriaId;
    }

    // Depuración: verifica el objeto where
    console.log('Filtros aplicados:', where);

    const platos = await Plato.findAll({
      where,
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre']
        },
        {
          model: Subcategoria,
          as: 'subcategoria',
          attributes: ['id', 'nombre']
        }
      ]
    });

    // Procesa cada plato para reemplazar los IDs de alergenos por sus nombres
    const platosProcesados = await Promise.all(platos.map(async plato => {
      const platoObj = plato.toJSON();
      delete platoObj.categoria_id;
      delete platoObj.subcategoria_id;

      if (Array.isArray(platoObj.alergenos) && platoObj.alergenos.length > 0) {
        // Busca los nombres de los alergenos
        const alergenos = await Alergeno.findAll({
          where: { id: platoObj.alergenos },
          attributes: ['id', 'nombre']
        });
        // Reemplaza el array de IDs por el array de objetos
        platoObj.alergenos = alergenos.map(a => ({ id: a.id, nombre: a.nombre }));
      }

      return platoObj;
    }));

    res.json(platosProcesados);
  } catch (err) {
    console.error('Error al listar platos:', err);
    res.status(500).json({ error: 'Error al listar platos' });
  }
};

//Middleware de validación de rol admin
function requireAdmin(req, res, next) {
  if (req.user) return next();
  return res.status(403).json({ error: 'Solo administradores pueden realizar esta acción' });
}

// Validaciones para crear y modificar plato
exports.validatePlato = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('categoria_id').optional().isInt().withMessage('La categoría debe ser un número entero'),
  body('descripcion').optional().isString().withMessage('La descripción debe ser texto'),
  body('image').optional().isString().withMessage('La imagen debe ser una URL o nombre de archivo'),
  body('disponible').optional().isBoolean().withMessage('Disponible debe ser verdadero o falso'),
  body('alergenos').optional().isArray().withMessage('Los alérgenos deben ser un array')
];

exports.crear = [requireAdmin, exports.validatePlato, async (req, res) => {
  console.log('=== CREAR PLATO - INICIO ===');
  console.log('Usuario:', req.user);
  console.log('Body recibido:', JSON.stringify(req.body, null, 2));
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Validar que la categoría exista
    if (req.body.categoria_id) {
      const categoria = await Categoria.findByPk(req.body.categoria_id);
      if (!categoria) {
        console.log('Categoría no encontrada:', req.body.categoria_id);
        return res.status(400).json({ error: 'La categoría especificada no existe' });
      }
      console.log('Categoría encontrada:', categoria.nombre);
    }
    
    // Validar que la subcategoría exista y pertenezca a la categoría
    if (req.body.subcategoria_id) {
      const subcategoria = await Subcategoria.findByPk(req.body.subcategoria_id);
      if (!subcategoria) {
        console.log('Subcategoría no encontrada:', req.body.subcategoria_id);
        return res.status(400).json({ error: 'La subcategoría especificada no existe' });
      }
      if (req.body.categoria_id && subcategoria.categoria_id !== parseInt(req.body.categoria_id)) {
        console.log('Subcategoría no pertenece a la categoría:', subcategoria.categoria_id, '!=', req.body.categoria_id);
        return res.status(400).json({ error: 'La subcategoría no pertenece a la categoría seleccionada' });
      }
      console.log('Subcategoría encontrada:', subcategoria.nombre);
    }
    
    // Preparar datos del plato
    const platoData = {
      ...req.body,
      // usuario_creacion: req.user ? req.user.nombre_usuario : 'admin',
      fecha_creacion: new Date(),
      eliminado: false
    };
    
    console.log('Datos finales para crear plato:', JSON.stringify(platoData, null, 2));
    
    const plato = await Plato.create(platoData);
    console.log('Plato creado exitosamente:', plato.toJSON());
    
    // Recargar el plato con las relaciones
    const platoCompleto = await Plato.findByPk(plato.id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ]
    });
    
    res.status(201).json(platoCompleto);
  } catch (err) {
    console.error('Error detallado al crear plato:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.errors) {
      console.error('Validation errors:', err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      })));
    }
    console.error('Stack trace:', err.stack);
    
    res.status(400).json({ 
      error: 'Error al crear plato',
      details: err.message,
      validationErrors: err.errors ? err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      })) : undefined
    });
  }
}];

exports.modificar = [requireAdmin, exports.validatePlato, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const plato = await Plato.findByPk(req.params.id);
    if (!plato || plato.eliminado) return res.status(404).json({ error: 'Plato no encontrado' });
    await plato.update(req.body);
    res.json(plato);
  } catch (err) {
    res.status(400).json({ error: 'Error al modificar plato' });
  }
}];

exports.eliminar = [requireAdmin, async (req, res) => {
  try {
    const plato = await Plato.findByPk(req.params.id);
    if (!plato || plato.eliminado) return res.status(404).json({ error: 'Plato no encontrado' });
    await plato.update({ eliminado: true }); // Solo esto
    res.json({ mensaje: 'Plato eliminado lógicamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar plato' });
  }
}];

exports.obtenerCrecimiento = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const db = require('../config/db');
    
    // Obtener platos creados por mes en los últimos 6 meses
    const crecimiento = await Plato.findAll({
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
      platos: parseInt(item.cantidad)
    }));

    res.json(datosFormateados);
  } catch (err) {
    console.error('Error al obtener crecimiento de platos:', err);
    res.status(500).json({ error: 'Error al obtener datos de crecimiento' });
  }
};
