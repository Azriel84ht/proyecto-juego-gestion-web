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
    
    // --- INICIO DE CAMBIOS EN LOGIN ---

    // 1. Generar Access Token (corta duración, para las peticiones a la API)
    const accessTokenPayload = { id: user.id, username: user.username };
    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 2. Generar Refresh Token (larga duración, para renovar el access token)
    const refreshTokenPayload = { id: user.id };
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.JWT_REFRESH_SECRET, // Usa el nuevo secreto
      { expiresIn: '7d' }
    );

    // 3. Enviar el Refresh Token en una cookie segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // No accesible por JavaScript en el cliente
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
    });

    // 4. Enviar solo el Access Token en el cuerpo de la respuesta
    res.status(200).json({ accessToken });

    // --- FIN DE CAMBIOS EN LOGIN ---

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

// --- INICIO DE NUEVAS FUNCIONES ---

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token de refresco.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // El token es válido, generamos un nuevo Access Token.
    // Para que el nuevo token tenga el username, lo incluimos también en el payload.
    // Una alternativa más segura sería buscar el usuario en la BD con el `decoded.id`.
    const accessTokenPayload = { id: decoded.id };
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ accessToken });

  } catch (error) {
    return res.status(403).json({ message: 'Token de refresco no válido.' });
  }
};

const logout = (req, res) => {
  // Limpiamos la cookie que contiene el refresh token
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout exitoso.' });
};

// --- FIN DE NUEVAS FUNCIONES ---

module.exports = {
  register,
  login,
  getProfile,
  refresh, // <-- Añadido
  logout,  // <-- Añadido
};