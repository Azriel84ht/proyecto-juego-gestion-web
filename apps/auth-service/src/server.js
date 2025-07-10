const express = require('express');
const cookieParser = require('cookie-parser'); // <-- AÑADIDO
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cookieParser()); // <-- AÑADIDO

// Probar conexión a la BD al iniciar
testConnection();

// Rutas de la API
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Auth service escuchando en el puerto ${PORT}`);
});