const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport'); // <-- AÑADIDO
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Configuración de Passport
app.use(passport.initialize()); // <-- AÑADIDO
require('./config/passport-setup'); // <-- AÑADIDO (Ejecuta la configuración de la estrategia)

// Probar conexión a la BD al iniciar
testConnection();

// Rutas de la API
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Auth service escuchando en el puerto ${PORT}`);
});