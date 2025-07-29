const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para generar token
const generarToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registrar usuario (cliente)
exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, password } = req.body;

  try {
    if (!nombre || !correo || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const usuarioExistente = await pool.query('SELECT * FROM users WHERE correo = $1', [correo]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheado = await bcrypt.hash(password, salt);

    const nuevoUsuario = await pool.query(
      `INSERT INTO users (nombre, correo, password, rol)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, correo, passwordHasheado, 'cliente']
    );

    const usuario = nuevoUsuario.rows[0];

    res.status(201).json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      token: generarToken(usuario.id, usuario.rol)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

// Login usuario
exports.loginUsuario = async (req, res) => {
  const { correo, password } = req.body;

  try {
    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const usuarioResult = await pool.query('SELECT * FROM users WHERE correo = $1', [correo]);
    const usuario = usuarioResult.rows[0];

    if (!usuario) {
      return res.status(400).json({ mensaje: 'Usuario no encontrado' });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecta) {
      return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      token: generarToken(usuario.id, usuario.rol)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};
