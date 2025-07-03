// Carga las variables de entorno desde el archivo .env en la raíz del proyecto
require('dotenv').config({ path: '../../.env' });

const express = require('express');

const app = express();
// El puerto se define en el archivo .env
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Middlewares esenciales
app.use(express.json()); // Permite al servidor entender cuerpos de solicitud en formato JSON

// Ruta de prueba para verificar que el servicio está activo
app.get('/api/auth', (req, res) => {
  res.status(200).send('Auth Service está funcionando correctamente. 🚀');
});

app.listen(PORT, () => {
  console.log(`Servicio de autenticación escuchando en el puerto ${PORT}`);
});