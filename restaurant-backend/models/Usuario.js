  const { DataTypes } = require('sequelize');
  const db = require('../config/db');

  const Usuario = db.define('Usuario', {
    nombre_usuario: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    rol_id: { type: DataTypes.INTEGER, defaultValue: 2 },
    eliminado: { type: DataTypes.TINYINT, defaultValue: 0 },
  }, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_modificacion',
  });

  Usuario.belongsTo(require('./Rol'), { foreignKey: 'rol_id', as: 'rol' });

  module.exports = Usuario;