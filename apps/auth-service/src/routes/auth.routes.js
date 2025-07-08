const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

// Ruta existente para el registro
router.post('/register', authController.register);

// Nueva ruta para el inicio de sesión
router.post('/login', authController.login);

module.exports = router;