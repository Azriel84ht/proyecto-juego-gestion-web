// Carga las variables de entorno desde el archivo .env en la raíz
require('dotenv').config({ path: '../.env' }); 

const { testConnection } = require('../src/config/db');

console.log('Ejecutando prueba de conexión...');
testConnection();