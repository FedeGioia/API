const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Categoria = require('./Categoria');
const Subcategoria = require('./Subcategoria');


const Plato = db.define('Plato', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  subcategoria_id: { type: DataTypes.INTEGER },
  descripcion: { type: DataTypes.TEXT },
  alergenos: { type: DataTypes.JSON },       
  precio: { type: DataTypes.FLOAT, allowNull: false },
  categoria_id: { type: DataTypes.INTEGER },
  disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
  eliminado: { type: DataTypes.BOOLEAN, defaultValue: false },
  // usuario_creacion: { type: DataTypes.STRING },
  // usuario_modificacion: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
}, {
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

Plato.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Plato.belongsTo(Subcategoria, { foreignKey: 'subcategoria_id', as: 'subcategoria' });

module.exports = Plato;