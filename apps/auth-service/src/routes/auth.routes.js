const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { loginLimiter, refreshLimiter } = require('../middleware/rateLimiter'); // <-- 1. Importar limitadores

const router = Router();

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login); // <-- 2. Aplicar limitador de login
router.post('/refresh-token', refreshLimiter, authController.refresh); // <-- 3. Aplicar limitador de refresh
router.post('/logout', authController.logout);

// Ruta protegida
router.get('/profile', protect, authController.getProfile);

module.exports = router;