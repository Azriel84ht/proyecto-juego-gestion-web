const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

// Define la ruta POST /register y la asocia a la función del controlador
router.post('/register', authController.register);

module.exports = router;