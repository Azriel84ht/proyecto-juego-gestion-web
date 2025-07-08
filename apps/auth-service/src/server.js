// ... otras importaciones como express, etc.
const express = require('express');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes'); // <-- 1. IMPORTA LAS RUTAS

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json()); // Para que Express entienda peticiones con body en formato JSON

// Probar conexión a la BD al iniciar (opcional, lo usamos para el test)
testConnection();

// Rutas de la API
app.use('/api/auth', authRoutes); // <-- 2. USA LAS RUTAS BAJO EL PREFIJO /api/auth

// ... resto de la configuración del servidor

app.listen(PORT, () => {
  console.log(`🚀 Auth service escuchando en el puerto ${PORT}`);
});