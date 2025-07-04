const Alergeno = require('../models/Alergeno');

// Obtener todos los alérgenos
const obtenerAlergenos = async (req, res) => {
  try {
    console.log('📋 Obteniendo lista de alérgenos...');
    
    const alergenos = await Alergeno.findAll({
      order: [['nombre', 'ASC']]
    });
    
    console.log(`✅ Se encontraron ${alergenos.length} alérgenos`);
    
    // Asegurar que siempre retornemos un array
    const alergenosArray = Array.isArray(alergenos) ? alergenos : [];
    res.json(alergenosArray);
  } catch (error) {
    console.error('❌ Error al obtener alérgenos:', error);
    // En caso de error, devolver un array vacío para evitar errores en el frontend
    res.status(200).json([]);
  }
};

// Crear un nuevo alérgeno
const crearAlergeno = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    console.log('📝 Creando nuevo alérgeno:', { nombre });
    
    // Validar datos requeridos
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del alérgeno es requerido' });
    }
    
    // Verificar si ya existe un alérgeno con ese nombre
    const alergenoExistente = await Alergeno.findOne({ where: { nombre } });
    if (alergenoExistente) {
      return res.status(400).json({ message: 'Ya existe un alérgeno con ese nombre' });
    }
    
    const nuevoAlergeno = await Alergeno.create({ nombre });
    
    console.log('✅ Alérgeno creado:', nuevoAlergeno.toJSON());
    
    res.status(201).json(nuevoAlergeno);
  } catch (error) {
    console.error('❌ Error al crear alérgeno:', error);
    res.status(500).json({ 
      message: 'Error al crear alérgeno', 
      error: error.message 
    });
  }
};

// Obtener un alérgeno por ID
const obtenerAlergenoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Buscando alérgeno con ID:', id);
    
    const alergeno = await Alergeno.findByPk(id);
    
    if (!alergeno) {
      return res.status(404).json({ message: 'Alérgeno no encontrado' });
    }
    
    console.log('✅ Alérgeno encontrado:', alergeno.toJSON());
    
    res.json(alergeno);
  } catch (error) {
    console.error('❌ Error al obtener alérgeno:', error);
    res.status(500).json({ 
      message: 'Error al obtener alérgeno', 
      error: error.message 
    });
  }
};

// Actualizar un alérgeno
const actualizarAlergeno = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    
    console.log('✏️ Actualizando alérgeno:', { id, nombre });
    
    const alergeno = await Alergeno.findByPk(id);
    
    if (!alergeno) {
      return res.status(404).json({ message: 'Alérgeno no encontrado' });
    }
    
    // Verificar si ya existe otro alérgeno con ese nombre
    const alergenoExistente = await Alergeno.findOne({ 
      where: { nombre },
      where: { id: { [require('sequelize').Op.ne]: id } }
    });
    
    if (alergenoExistente) {
      return res.status(400).json({ message: 'Ya existe un alérgeno con ese nombre' });
    }
    
    await alergeno.update({ nombre });
    
    console.log('✅ Alérgeno actualizado:', alergeno.toJSON());
    
    res.json(alergeno);
  } catch (error) {
    console.error('❌ Error al actualizar alérgeno:', error);
    res.status(500).json({ 
      message: 'Error al actualizar alérgeno', 
      error: error.message 
    });
  }
};

// Eliminar un alérgeno
const eliminarAlergeno = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Eliminando alérgeno con ID:', id);
    
    const alergeno = await Alergeno.findByPk(id);
    
    if (!alergeno) {
      return res.status(404).json({ message: 'Alérgeno no encontrado' });
    }
    
    await alergeno.destroy();
    
    console.log('✅ Alérgeno eliminado correctamente');
    
    res.json({ message: 'Alérgeno eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar alérgeno:', error);
    res.status(500).json({ 
      message: 'Error al eliminar alérgeno', 
      error: error.message 
    });
  }
};

module.exports = {
  obtenerAlergenos,
  crearAlergeno,
  obtenerAlergenoPorId,
  actualizarAlergeno,
  eliminarAlergeno
};
