const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');  // Para manejar rutas de archivos
const db = require('./db');
require('dotenv').config();
const routes = require('./routes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS) del frontend
app.use(express.static(path.join(__dirname, '../taskinator')));

// Rutas de la API
app.use('/api', routes);
app.use(cors({
    origin: 'http://localhost:5500', //fiveserver
  }));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor corriendo!');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
    console.log('DB_NAME:', process.env.DB_NAME);
});
