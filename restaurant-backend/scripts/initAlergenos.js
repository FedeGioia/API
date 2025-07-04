const db = require('../config/db');
const Alergeno = require('../models/Alergeno');

async function initAlergenos() {
  try {
    await db.sync();
    
    const alergenos = [
      { nombre: 'Gluten' },
      { nombre: 'Huevos' },
      { nombre: 'Lácteos' },
      { nombre: 'Frutos secos' },
      { nombre: 'Pescado' },
      { nombre: 'Mariscos' },
      { nombre: 'Soja' },
      { nombre: 'Sésamo' },
      { nombre: 'Apio' },
      { nombre: 'Mostaza' },
      { nombre: 'Sulfitos' },
      { nombre: 'Altramuces' },
      { nombre: 'Cacahuetes' },
      { nombre: 'Moluscos' }
    ];

    for (const alergenoData of alergenos) {
      const [alergeno, created] = await Alergeno.findOrCreate({
        where: { nombre: alergenoData.nombre },
        defaults: alergenoData
      });
      
      if (created) {
        console.log(`✅ Alérgeno creado: ${alergeno.nombre}`);
      } else {
        console.log(`ℹ️  Alérgeno ya existe: ${alergeno.nombre}`);
      }
    }
    
    console.log('🎉 Inicialización de alérgenos completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar alérgenos:', error);
    process.exit(1);
  }
}

initAlergenos();
