const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { loginLimiter, refreshLimiter } = require('../middleware/rateLimiter');

const router = Router();

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh-token', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify-email', authController.verifyEmail); // <-- AÑADIDO

// Ruta protegida
router.get('/profile', protect, authController.getProfile);

module.exports = router;