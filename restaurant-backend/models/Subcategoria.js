const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Subcategoria = db.define('Subcategoria', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  eliminado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  eliminado_por: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_eliminacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'subcategorias',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Subcategoria;