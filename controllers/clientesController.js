const pool = require('../config/db');

// Registrar cliente (solo admin)
exports.registrarCliente = async (req, res) => {
  const { nombre, correo, telefono } = req.body;
  const adminId = req.user.id; // usuario autenticado (admin)

  try {
    // Verificar si el correo ya está registrado en clientes
    const clienteExistente = await pool.query('SELECT * FROM clientes WHERE correo = $1', [correo]);
    if (clienteExistente.rows.length > 0) {
      return res.status(400).json({ mensaje: 'El correo del cliente ya está registrado' });
    }

    // Insertar nuevo cliente
    const nuevoCliente = await pool.query(
      'INSERT INTO clientes (nombre, correo, telefono, creado_por) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, correo, telefono, adminId]
    );

    res.status(201).json({ cliente: nuevoCliente.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};
