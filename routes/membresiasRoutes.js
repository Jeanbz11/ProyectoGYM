const express = require('express');
const router = express.Router();
const {
  crearMembresia,
  actualizarEstado,
  listarMembresias,
  obtenerMembresiaCliente
} = require('../controllers/membresiasController');
const { proteger } = require('../middlewares/authMiddleware');

// Middleware para verificar admin
const esAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo admins' });
  }
  next();
};

// Crear membresía (solo admin)
router.post('/', proteger, esAdmin, crearMembresia);

// Actualizar estado de membresía (solo admin)
router.patch('/:id/estado', proteger, esAdmin, actualizarEstado);

// Listar todas las membresías (solo admin)
router.get('/', proteger, esAdmin, listarMembresias);

// Obtener la membresía activa del cliente autenticado
router.get('/mi-membresia', proteger, (req, res, next) => {
  if (req.user.rol !== 'cliente') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }
  next();
}, obtenerMembresiaCliente);

module.exports = router;
