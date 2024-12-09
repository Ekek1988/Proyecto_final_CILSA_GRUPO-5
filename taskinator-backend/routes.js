const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');
const secretKey = 'taskinator';

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios.' });
  }

  try {
    const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.status(201).json({ message: 'Usuario registrado con éxito', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el usuario', details: err });
  } 
});

// Ruta para el login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
      res.json({ message: 'Inicio de sesión exitoso', token, userId: user.id });  // Incluye el userId en la respuesta
    } else {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error en el login', details: err });
  }
});

// Ruta para crear una nueva tarea
router.post('/tasks', async (req, res) => {
  const { userId, title, category, description, status } = req.body;
  console.log('userId recibido en el servidor:', userId);  // Añadir esto para depurar

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const [result] = await db.query('INSERT INTO tasks (user_id, title, category, description, status) VALUES (?, ?, ?, ?, ?)', [userId, title, category, description, status]);
    res.status(201).json({ message: 'Tarea creada con éxito', taskId: result.insertId });
  } catch (err) {
    console.log('Error al crear la tarea:', err);  // Añadir esto para ver más detalles del error
    res.status(500).json({ error: 'Error al crear la tarea', details: err });
  }
});


// Ruta para actualizar el estado de una tarea
router.put('/tasks/:taskId/status', async (req, res) => {
  const taskId = req.params.taskId;
  const { status } = req.body;  // El nuevo estado

  if (!status) {
    return res.status(400).json({ error: 'El estado es obligatorio.' });
  }

  try {
    // Actualiza el estado de la tarea en la base de datos
    const result = await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Estado de la tarea actualizado con éxito' });
    } else {
      res.status(404).json({ error: 'Tarea no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado de la tarea', details: err });
  }
});

// Ruta para editar una tarea
router.put('/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;
  const { name, description, status } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Nombre y descripción son obligatorios' });
  }

  try {
    const result = await db.query(
      'UPDATE tasks SET name = ?, description = ?, status = ? WHERE id = ?',
      [name, description, status, taskId]
    );

    if (result.affectedRows > 0) {
      res.json({ message: 'Tarea actualizada con éxito' });
    } else {
      res.status(404).json({ error: 'Tarea no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la tarea', details: err });
  }
});



// Ruta para eliminar una tarea
router.delete('/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;

  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
    res.json({ message: 'Tarea eliminada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la tarea', details: err });
  }
});

module.exports = router;
