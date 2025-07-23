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
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.' });
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

    user = await userService.createUser({
      username,
      email,
      password_hash: passwordHash,
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await userService.updateUserById(user.id, {
      verification_token: hashedToken,
      verification_token_expires: tokenExpires,
    });

    // --- LÍNEA MODIFICADA ---
    const verificationUrl = `${process.env.SERVER_PROTOCOL}://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/auth/verify-email?token=${verificationToken}`;
    // --- FIN DE LA MODIFICACIÓN ---

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'El correo electrónico es obligatorio.' });
  }

  try {
    const user = await userService.findUserByEmailOrUsername(email, null);
    if (!user) {
      return res.status(404).json({ message: 'No se encontró un usuario con ese correo electrónico.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await userService.updateUserById(user.id, {
      password_reset_token: hashedToken,
      password_reset_token_expires: tokenExpires,
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const message = `Has solicitado un reseteo de contraseña. Por favor, haz clic en el siguiente enlace para resetear tu contraseña: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Reseteo de Contraseña',
      message,
    });

    return res.status(200).json({ message: 'Se ha enviado un correo electrónico con las instrucciones para resetear la contraseña.' });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'El token y la nueva contraseña son obligatorios.' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await userService.findUserByPasswordResetToken(hashedToken);
    if (!user) {
      return res.status(400).json({ message: 'Token de reseteo de contraseña no válido o expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await userService.updateUserById(user.id, {
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_token_expires: null,
    });

    return res.status(200).json({ message: 'La contraseña ha sido reseteada exitosamente.' });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const { authenticator } = require('otplib');
const qrcode = require('qrcode');

const generateTwoFactorSecret = async (req, res) => {
  const secret = authenticator.generateSecret();
  const user = req.user;

  await userService.updateUserById(user.id, { two_factor_secret: secret });

  const otpauth = authenticator.keyuri(user.email, 'YourApp', secret);

  qrcode.toDataURL(otpauth, (err, imageUrl) => {
    if (err) {
      console.error('Error with QR:', err);
      return res.status(500).json({ message: 'Error al generar el código QR.' });
    }
    res.json({ secret, qrCodeUrl: imageUrl });
  });
};

const enableTwoFactor = async (req, res) => {
  const { token } = req.body;
  const user = req.user;

  const isValid = authenticator.check(token, user.two_factor_secret);

  if (!isValid) {
    return res.status(400).json({ message: 'Token 2FA no válido.' });
  }

  await userService.updateUserById(user.id, { two_factor_enabled: true });

  res.json({ message: '2FA activado correctamente.' });
};

const disableTwoFactor = async (req, res) => {
  const user = req.user;
  await userService.updateUserById(user.id, { two_factor_enabled: false, two_factor_secret: null });
  res.json({ message: '2FA desactivado correctamente.' });
};

const verifyTwoFactor = async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isValid = authenticator.check(token, user.two_factor_secret);

    if (!isValid) {
      return res.status(400).json({ message: 'Token 2FA no válido.' });
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

    if (user.two_factor_enabled) {
      return res.status(200).json({ twoFactorEnabled: true, userId: user.id });
    }

    res.status(200).json({ accessToken });

  } catch (error) {
    console.error('Error en verifyTwoFactor:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updateProfile = async (req, res) => {
  const { username, email } = req.body;
  const user = req.user;

  try {
    const updatedUser = await userService.updateUserById(user.id, { username, email });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;

  try {
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userService.updateUserById(user.id, { password_hash: passwordHash });

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error en updatePassword:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const deleteAccount = async (req, res) => {
  const user = req.user;

  try {
    await userService.deleteUserById(user.id);
    res.json({ message: 'Cuenta eliminada correctamente.' });
  } catch (error) {
    console.error('Error en deleteAccount:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
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
  forgotPassword,
  resetPassword,
  generateTwoFactorSecret,
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
  updateProfile,
  updatePassword,
  deleteAccount,
};