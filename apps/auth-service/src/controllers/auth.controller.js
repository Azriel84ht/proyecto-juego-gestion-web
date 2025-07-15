const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UAParser = require('ua-parser-js');
const userService = require('../services/user.service');
const sendEmail = require('../services/email.service');

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
    let user = await userService.findUserByEmailOrUsername(email, username);
    if (user) {
      return res.status(409).json({ message: 'El email o nombre de usuario ya está en uso.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user = await userService.createUser(username, email, passwordHash);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await userService.updateUserById(user.id, {
      verification_token: hashedToken,
      verification_token_expires: tokenExpires,
    });

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
    const message = `Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: \n\n ${verificationUrl}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Verificación de Correo Electrónico',
      message,
    });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor, revisa tu correo para verificar tu cuenta.',
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

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    try {
      const ua = UAParser(req.headers['user-agent']);
      const deviceInfo = `${ua.browser.name || 'N/A'} on ${ua.os.name || 'N/A'}`;
      userService.addLoginHistory(user.id, req.ip, req.headers['user-agent'], deviceInfo);
    } catch (trackingError) {
      console.error('Error al registrar el historial de login:', trackingError);
    }

    const accessTokenPayload = { id: user.id, username: user.username };
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const refreshTokenPayload = { id: user.id };
    const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken });

  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token de refresco.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessTokenPayload = { id: decoded.id };
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ accessToken });

  } catch (error) {
    return res.status(403).json({ message: 'Token de refresco no válido.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout exitoso.' });
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await userService.findUserByVerificationToken(hashedToken);
    
    if (!user) {
      return res.status(400).json({ message: 'Token de verificación no válido o expirado.' });
    }

    await userService.updateUserById(user.id, {
      is_verified: true,
      verification_token: null,
      verification_token_expires: null,
    });

    res.status(200).json({ message: 'Correo electrónico verificado exitosamente.' });

  } catch (error) {
    console.error('Error en la verificación de email:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getLoginHistoryController = async (req, res) => {
  try {
    const history = await userService.getLoginHistory(req.user.id);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error al obtener el historial de login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refresh,
  logout,
  verifyEmail,
  getLoginHistoryController,
};