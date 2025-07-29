const express = require('express');
const router = express.Router();

const { proteger } = require('../middlewares/authMiddleware');
const { esAdmin } = require('../middlewares/adminMiddleware');

const { registrarUsuario, loginUsuario } = require('../controllers/usuariosController');

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// Ruta protegida solo para admins
router.get('/admin-only', proteger, esAdmin, (req, res) => {
  res.json({ mensaje: 'Solo un admin puede ver esto' });
});

module.exports = router;
