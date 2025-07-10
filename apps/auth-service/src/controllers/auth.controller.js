const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');
const sendEmail = require('../services/email.service');

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }
  // ... (otras validaciones)

  try {
    let user = await userService.findUserByEmailOrUsername(email, username);
    if (user) {
      return res.status(409).json({ message: 'El email o nombre de usuario ya está en uso.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user = await userService.createUser(username, email, passwordHash);

    // --- INICIO DE LÓGICA DE VERIFICACIÓN ---

    // 1. Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de validez

    // 2. Guardar el token hasheado y su expiración en el usuario
    await userService.updateUserById(user.id, {
      verification_token: hashedToken,
      verification_token_expires: tokenExpires,
    });

    // 3. Enviar el email de verificación con el token original (sin hashear)
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
    const message = `Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: \n\n ${verificationUrl}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Verificación de Correo Electrónico',
      message,
    });

    // 4. Devolver una respuesta indicando al usuario que revise su email
    return res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor, revisa tu correo para verificar tu cuenta.',
    });
    
    // --- FIN DE LÓGICA DE VERIFICACIÓN ---

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

    // --- INICIO DE CAMBIO EN LOGIN ---
    // 1. Comprobar si la cuenta está verificada
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' });
    }
    // --- FIN DE CAMBIO EN LOGIN ---

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
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
  // ... código ...
};

const logout = (req, res) => {
  // ... código ...
};


// --- INICIO DE NUEVA FUNCIÓN ---
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado.' });
  }

  // Hashear el token recibido para buscarlo en la base de datos
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await userService.findUserByVerificationToken(hashedToken);
    
    if (!user) {
      return res.status(400).json({ message: 'Token de verificación no válido o expirado.' });
    }

    // El token es válido, actualizamos al usuario
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
// --- FIN DE NUEVA FUNCIÓN ---


module.exports = {
  register,
  login,
  getProfile,
  refresh,
  logout,
  verifyEmail, // <-- Añadido
};