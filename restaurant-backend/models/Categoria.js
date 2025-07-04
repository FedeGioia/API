const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Categoria = db.define('Categoria', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true
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
  tableName: 'categoria',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Categoria;