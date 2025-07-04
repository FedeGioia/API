const Categoria = require('./Categoria');
const Subcategoria = require('./Subcategoria');
const Plato = require('./Plato');
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Alergeno = require('./Alergeno');

// Definir asociaciones aquí
Categoria.hasMany(Subcategoria, { foreignKey: 'categoria_id', as: 'subcategorias' });
Subcategoria.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

module.exports = {
  Categoria,
  Subcategoria,
  Plato,
  Usuario,
  Rol,
  Alergeno,
}; 