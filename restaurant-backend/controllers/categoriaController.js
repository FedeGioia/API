const { Categoria, Subcategoria } = require('../models');
const { body, validationResult } = require('express-validator');

// Middleware para verificar que sea admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.rol === 1) return next();
  return res.status(403).json({ error: 'Solo administradores pueden realizar esta acción' });
}

// Listar categorías con opciones de filtrado
exports.listarCategorias = async (req, res) => {
  try {
    const { nombre, limit, offset } = req.query;
    
    let whereClause = {};
    if (nombre) {
      whereClause.nombre = { [require('sequelize').Op.like]: `%${nombre}%` };
    }

    const options = {
      where: whereClause,
      attributes: ['id', 'nombre', 'createdAt', 'updatedAt'],
      include: [{
        model: Subcategoria,
        as: 'subcategorias',
        attributes: ['id', 'nombre'],
        required: false
      }]
    };

    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    const categorias = await Categoria.findAll(options);
    res.json(categorias);
  } catch (err) {
    console.error('Error al listar categorías:', err);
    res.status(500).json({ error: 'Error al listar categorías' });
  }
};

// Obtener categoría específica
exports.obtenerCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: [{
        model: Subcategoria,
        as: 'subcategorias',
        attributes: ['id', 'nombre']
      }]
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(categoria);
  } catch (err) {
    console.error('Error al obtener categoría:', err);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// Crear categoría
exports.crearCategoria = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nombre } = req.body;

    // Verificar si ya existe una categoría con ese nombre
    const categoriaExistente = await Categoria.findOne({ where: { nombre } });
    if (categoriaExistente) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    const nuevaCategoria = await Categoria.create({ nombre });
    res.status(201).json(nuevaCategoria);
  } catch (err) {
    console.error('Error al crear categoría:', err);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Modificar categoría
exports.modificarCategoria = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si ya existe otra categoría con ese nombre
    const categoriaExistente = await Categoria.findOne({
      where: {
        nombre,
        id: { [require('sequelize').Op.ne]: id }
      }
    });
    if (categoriaExistente) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    await categoria.update({ nombre });
    res.json(categoria);
  } catch (err) {
    console.error('Error al modificar categoría:', err);
    res.status(500).json({ error: 'Error al modificar categoría' });
  }
};

// Eliminar categoría (lógicamente)
exports.eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si hay subcategorías asociadas
    const subcategoriasCount = await Subcategoria.count({ where: { categoria_id: id } });
    if (subcategoriasCount > 0) {
      return res.status(400).json({
        error: `No se puede eliminar la categoría porque tiene ${subcategoriasCount} subcategoría(s) asociada(s)`
      });
    }

    // Eliminación lógica (marcar como eliminada)
    await categoria.update({ 
      eliminado: true, 
      eliminado_por: req.user.nombre_usuario,
      fecha_eliminacion: new Date()
    });

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

// Validaciones para categorías
exports.validateCategoria = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la categoría es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
];

// Exportar middleware de autenticación
exports.requireAdmin = requireAdmin;

// Servicio para listar todas las subcategorías con filtros
exports.listarSubcategorias = async (req, res) => {
  try {
    const { nombre, categoria_id, limit, offset } = req.query;
    
    let whereClause = {};
    if (nombre) {
      whereClause.nombre = { [require('sequelize').Op.like]: `%${nombre}%` };
    }
    if (categoria_id) {
      whereClause.categoria_id = categoria_id;
    }

    const options = {
      where: whereClause,
      attributes: ['id', 'nombre', 'categoria_id', 'createdAt', 'updatedAt'],
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    };

    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    const subcategorias = await Subcategoria.findAll(options);
    res.json(subcategorias);
  } catch (err) {
    console.error('Error al listar subcategorías:', err);
    res.status(500).json({ error: 'Error al listar subcategorías' });
  }
};

// Obtener subcategoría específica
exports.obtenerSubcategoria = async (req, res) => {
  try {
    const subcategoria = await Subcategoria.findByPk(req.params.id, {
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });

    if (!subcategoria) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    res.json(subcategoria);
  } catch (err) {
    console.error('Error al obtener subcategoría:', err);
    res.status(500).json({ error: 'Error al obtener subcategoría' });
  }
};

// Servicio para crear una nueva subcategoría
exports.crearSubcategoria = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nombre, categoria_id } = req.body;

    // Verificar que la categoría padre existe
    const categoria = await Categoria.findByPk(categoria_id);
    if (!categoria) {
      return res.status(400).json({ error: 'La categoría especificada no existe' });
    }

    // Verificar si ya existe una subcategoría con ese nombre en la misma categoría
    const subcategoriaExistente = await Subcategoria.findOne({
      where: { nombre, categoria_id }
    });
    if (subcategoriaExistente) {
      return res.status(400).json({ error: 'Ya existe una subcategoría con ese nombre en esta categoría' });
    }

    const nuevaSubcategoria = await Subcategoria.create({ nombre, categoria_id });
    
    // Devolver la subcategoría con su categoría padre
    const subcategoriaConCategoria = await Subcategoria.findByPk(nuevaSubcategoria.id, {
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });

    res.status(201).json(subcategoriaConCategoria);
  } catch (err) {
    console.error('Error al crear subcategoría:', err);
    res.status(500).json({ error: 'Error al crear subcategoría' });
  }
};

// Modificar subcategoría
exports.modificarSubcategoria = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { nombre, categoria_id } = req.body;

    const subcategoria = await Subcategoria.findByPk(id);
    if (!subcategoria) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    // Si se está cambiando la categoría, verificar que existe
    if (categoria_id && categoria_id !== subcategoria.categoria_id) {
      const categoria = await Categoria.findByPk(categoria_id);
      if (!categoria) {
        return res.status(400).json({ error: 'La categoría especificada no existe' });
      }
    }

    // Verificar si ya existe otra subcategoría con ese nombre en la misma categoría
    const subcategoriaExistente = await Subcategoria.findOne({
      where: {
        nombre,
        categoria_id: categoria_id || subcategoria.categoria_id,
        id: { [require('sequelize').Op.ne]: id }
      }
    });
    if (subcategoriaExistente) {
      return res.status(400).json({ error: 'Ya existe una subcategoría con ese nombre en esta categoría' });
    }

    await subcategoria.update({ nombre, categoria_id });
    
    // Devolver la subcategoría actualizada con su categoría
    const subcategoriaActualizada = await Subcategoria.findByPk(id, {
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });

    res.json(subcategoriaActualizada);
  } catch (err) {
    console.error('Error al modificar subcategoría:', err);
    res.status(500).json({ error: 'Error al modificar subcategoría' });
  }
};

// Eliminar subcategoría (lógicamente)
exports.eliminarSubcategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategoria = await Subcategoria.findByPk(id);
    if (!subcategoria) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    // Verificar si hay platos asociados a esta subcategoría
    const Plato = require('../models/Plato');
    const platosCount = await Plato.count({ where: { subcategoria_id: id } });
    if (platosCount > 0) {
      return res.status(400).json({
        error: `No se puede eliminar la subcategoría porque tiene ${platosCount} plato(s) asociado(s)`
      });
    }

    // Eliminación lógica
    await subcategoria.update({ 
      eliminado: true, 
      eliminado_por: req.user.nombre_usuario,
      fecha_eliminacion: new Date()
    });

    res.json({ mensaje: 'Subcategoría eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar subcategoría:', err);
    res.status(500).json({ error: 'Error al eliminar subcategoría' });
  }
};

// Validaciones para subcategorías
exports.validateSubcategoria = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la subcategoría es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('categoria_id')
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La categoría debe ser un ID válido')
];