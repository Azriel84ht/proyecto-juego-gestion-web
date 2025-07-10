const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refresh); // <-- AÑADIDO
router.post('/logout', authController.logout);       // <-- AÑADIDO

// Ruta protegida
router.get('/profile', protect, authController.getProfile);

module.exports = router;