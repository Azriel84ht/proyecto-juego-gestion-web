const bcrypt = require('bcrypt');
const userService = require('../services/user.service');

const register = async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Validar que los campos no estén vacíos
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // 2. Usar el servicio para verificar si el usuario ya existe
    const existingUser = await userService.findUserByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(409).json({ message: 'El email o nombre de usuario ya está en uso.' });
    }

    // 3. Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Usar el servicio para crear el nuevo usuario
    const newUser = await userService.createUser(username, email, passwordHash);

    // 5. Devolver una respuesta exitosa
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