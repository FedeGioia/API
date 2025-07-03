const Roles = require('../models/Rol');
const db = require('../config/db');

const rolesIniciales = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Usuario' },
  { id: 3, nombre: 'Editor' }
];

async function inicializarRoles() {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Sincronizar el modelo
    await Roles.sync();

    // Verificar si ya existen roles
    const rolesExistentes = await Roles.count();
    
    if (rolesExistentes === 0) {
      console.log('Inicializando roles básicos...');
      
      for (const rol of rolesIniciales) {
        await Roles.create(rol);
        console.log(`Rol creado: ${rol.nombre}`);
      }
      
      console.log('Roles inicializados correctamente.');
    } else {
      console.log('Los roles ya existen en la base de datos.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar roles:', error);
    process.exit(1);
  }
}

inicializarRoles(); 