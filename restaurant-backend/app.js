const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const platoRoutes = require('./routes/platos');
const usuarioRoutes = require('./routes/usuarios');
const rolesRoutes = require('./routes/roles'); // Importa las rutas de roles
const authRoutes = require('./routes/auth');
const categoriaRoutes = require('./routes/categorias');
const db = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/platos', platoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api', authRoutes);
app.use('/api', categoriaRoutes);

// Probar conexión DB
(async () => {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
})();

// Puerto de escucha
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
