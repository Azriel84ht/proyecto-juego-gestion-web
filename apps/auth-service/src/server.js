const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors'); // <-- AÑADIDO
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- INICIO DE CONFIGURACIÓN DE CORS ---
const corsOptions = {
  origin: 'http://localhost:8080', // Permite solo peticiones desde el cliente web
  credentials: true, // Permite el envío de cookies
};
app.use(cors(corsOptions));
// --- FIN DE CONFIGURACIÓN DE CORS ---

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Configuración de Passport
app.use(passport.initialize());
require('./config/passport-setup');

// Probar conexión a la BD al iniciar
testConnection();

// Rutas de la API
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Auth service escuchando en el puerto ${PORT}`);
});