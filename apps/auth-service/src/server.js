const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.set('trust proxy', 1); // <-- AÑADIDO
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
};
app.use(cors(corsOptions));

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