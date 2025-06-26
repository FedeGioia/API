const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ where: { eliminado: false } });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

exports.crear = async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const usuario = await Usuario.create({ ...req.body, password: hash });
    res.status(201).json(usuario);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear usuario' });
  }
};

exports.modificar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario || usuario.eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
    await usuario.update(req.body);
    res.json(usuario);
  } catch (err) {
    res.status(400).json({ error: 'Error al modificar usuario' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario || usuario.eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
    await usuario.update({ eliminado: true });
    res.json({ mensaje: 'Usuario eliminado lógicamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Body recibido:', req.body);
    const usuario = await Usuario.findOne({ where: { nombre_usuario: req.body.nombre_usuario } });
    if (!usuario || usuario.eliminado) {
      console.log('Usuario no encontrado o eliminado');
      return res.status(401).json({ error: 'Credenciales inválidas 1' });
    }

    const match = await bcrypt.compare(req.body.password, usuario.password);
    if (!match) {
      console.log('Password incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas 2' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre_usuario: usuario.nombre_usuario, rol: usuario.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user:{nombre_usuario:usuario.nombre_usuario, rol: usuario.rol_id, id: usuario.id} });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
};
