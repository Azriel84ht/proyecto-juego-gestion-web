const rateLimit = require('express-rate-limit');

// Limitador estricto para el endpoint de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limita cada IP a 5 peticiones de login por ventana de 15 minutos
  message: { message: 'Demasiados intentos de inicio de sesión desde esta IP. Por favor, inténtelo de nuevo después de 15 minutos.' },
  standardHeaders: true, // Devuelve información del límite en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita las cabeceras `X-RateLimit-*`
});

// Limitador más permisivo para el endpoint de refresco de token
const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // Limita cada IP a 30 peticiones de refresco por hora
  message: { message: 'Demasiadas peticiones para refrescar el token.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, refreshLimiter };