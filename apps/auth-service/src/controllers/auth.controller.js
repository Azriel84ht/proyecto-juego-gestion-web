const bcrypt = require('bcrypt');
const userService = require('../services/user.service');

const register = async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Validación de campos vacíos
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  // --- INICIO DE NUEVAS VALIDACIONES ---

  // 2. Validación de longitud de la contraseña
  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  // 3. Validación de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'El formato del correo electrónico no es válido.' });
  }

  // --- FIN DE NUEVAS VALIDACIONES ---

  try {
    const existingUser = await userService.findUserByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(409).json({ message: 'El email o nombre de usuario ya está en uso.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await userService.createUser(username, email, passwordHash);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: newUser,
    });
  } catch (error) {
    console.error('Error en el registro de usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  register,
};