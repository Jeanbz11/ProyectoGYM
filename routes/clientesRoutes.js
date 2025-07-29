const express = require('express');
const router = express.Router();
const { registrarCliente } = require('../controllers/clientesController');
const { proteger } = require('../middlewares/authMiddleware');

// Middleware para verificar admin
const esAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo admins' });
  }
  next();
};

router.post('/', proteger, esAdmin, registrarCliente);

module.exports = router;
