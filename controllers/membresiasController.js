const pool = require('../config/db');

// Crear o renovar membresía para un cliente (admin o cliente)
exports.crearMembresia = async (req, res) => {
  let cliente_id;

  // Si es admin, debe enviar cliente_id en el body
  if (req.user.rol === 'admin') {
    cliente_id = req.body.cliente_id;
    if (!cliente_id) {
      return res.status(400).json({ mensaje: 'Debe enviar cliente_id' });
    }
  } else if (req.user.rol === 'cliente') {
    // Si es cliente, usamos su id del token y no debe mandar cliente_id en body
    cliente_id = req.user.id;
  } else {
    return res.status(403).json({ mensaje: 'Rol no autorizado para crear membresías' });
  }

  const { fecha_inicio, fecha_fin, estado = 'activa' } = req.body;

  try {
    // Validar que el cliente exista
    const cliente = await pool.query('SELECT * FROM clientes WHERE id = $1', [cliente_id]);
    if (cliente.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Insertar membresía
    const membresia = await pool.query(
      `INSERT INTO membresias (cliente_id, fecha_inicio, fecha_fin, estado)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [cliente_id, fecha_inicio, fecha_fin, estado]
    );

    res.status(201).json({ membresia: membresia.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// Actualizar estado de membresía (solo admin)
exports.actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ['activa', 'pausada', 'suspendida', 'vencida'];
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  try {
    const membresia = await pool.query('SELECT * FROM membresias WHERE id = $1', [id]);
    if (membresia.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Membresía no encontrada' });
    }

    const updated = await pool.query(
      'UPDATE membresias SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    res.json({ membresia: updated.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// Obtener todas las membresías (solo admin)
exports.listarMembresias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, c.nombre AS cliente_nombre, c.correo AS cliente_correo
       FROM membresias m
       JOIN clientes c ON m.cliente_id = c.id
       ORDER BY m.fecha_fin DESC`
    );
    res.json({ membresias: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// Obtener membresía activa de un cliente (cliente autenticado)
exports.obtenerMembresiaCliente = async (req, res) => {
  const clienteId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM membresias WHERE cliente_id = $1 AND estado = 'activa' ORDER BY fecha_fin DESC LIMIT 1`,
      [clienteId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No tiene membresía activa' });
    }
    res.json({ membresia: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};
