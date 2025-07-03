const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');
const db = require('../config/db');

const categoriasIniciales = [
  {
    nombre: 'Entrantes',
    subcategorias: []
  },
  {
    nombre: 'Ensaladas',
    subcategorias: []
  },
  {
    nombre: 'Platos Principales',
    subcategorias: ['Carnes Rojas', 'Carnes Blancas', 'Pescados']
  },
  {
    nombre: 'Pastas',
    subcategorias: []
  },
  {
    nombre: 'Postres',
    subcategorias: []
  },
  {
    nombre: 'Bebidas sin Alcohol',
    subcategorias: []
  },
  {
    nombre: 'Bebidas con Alcohol',
    subcategorias: []
  }
];

async function inicializarCategorias() {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Sincronizar los modelos
    await Categoria.sync();
    await Subcategoria.sync();

    // Verificar si ya existen categorías
    const categoriasExistentes = await Categoria.count();
    
    if (categoriasExistentes === 0) {
      console.log('Inicializando categorías y subcategorías del proyecto original...');
      
      for (const categoriaData of categoriasIniciales) {
        // Crear categoría
        const categoria = await Categoria.create({ nombre: categoriaData.nombre });
        console.log(`Categoría creada: ${categoria.nombre}`);
        
        // Crear subcategorías para esta categoría (solo si tiene)
        if (categoriaData.subcategorias.length > 0) {
          for (const subcategoriaNombre of categoriaData.subcategorias) {
            await Subcategoria.create({
              nombre: subcategoriaNombre,
              categoria_id: categoria.id
            });
            console.log(`  - Subcategoría creada: ${subcategoriaNombre}`);
          }
        }
      }
      
      console.log('Categorías y subcategorías inicializadas correctamente.');
    } else {
      console.log('Las categorías ya existen en la base de datos.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar categorías:', error);
    process.exit(1);
  }
}

inicializarCategorias(); 