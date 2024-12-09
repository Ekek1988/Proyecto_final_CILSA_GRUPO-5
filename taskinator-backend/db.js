const mysql = require('mysql2'); 
require('dotenv').config(); // Cargar las variables de entorno desde .env

// Crear la conexión usando createPool para manejar múltiples conexiones y promesas
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Puede estar vacío
  database: process.env.DB_NAME
});

// Usar el método promise() para que las consultas devuelvan promesas
module.exports = db.promise(); // Exporta la conexión con promesas
