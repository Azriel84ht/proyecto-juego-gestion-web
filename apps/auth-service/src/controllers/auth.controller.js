const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'El formato del correo electrónico no es válido.' });
  }

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

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
  }

  try {
    const user = await userService.findUserByEmailOrUsername(email, null);

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token: token });

  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getProfile = async (req, res) => {
  // Gracias al middleware 'protect', aquí ya tenemos acceso a req.user
  // que contiene el payload del token (id y username).
  res.status(200).json(req.user);
};

module.exports = {
  register,
  login,
  getProfile,
};