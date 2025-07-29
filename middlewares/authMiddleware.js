const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const proteger = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const usuario = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      if (!usuario.rows[0]) return res.status(401).json({ mensaje: 'No autorizado' });

      req.user = usuario.rows[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ mensaje: 'Token inválido' });
    }
  } else {
    res.status(401).json({ mensaje: 'Token no enviado' });
  }
};

module.exports = { proteger };
