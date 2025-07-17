const { Router } = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { loginLimiter, refreshLimiter } = require('../middleware/rateLimiter');

const router = Router();

// --- RUTAS DE LOGIN/REGISTRO CON GOOGLE ---
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// --- RUTAS DE LOGIN/REGISTRO CON FACEBOOK ---
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'], session: false })
);


// --- RUTAS DE VINCULACIÓN DE CUENTAS (PROTEGIDAS) ---
router.get(
  '/google/link',
  protect, // 1. Middleware que verifica que el usuario ya está logueado
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }) // 2. Inicia el flujo de Google
);

router.get(
  '/facebook/link',
  protect, // 1. Middleware que verifica que el usuario ya está logueado
  passport.authenticate('facebook', { scope: ['public_profile', 'email'], session: false }) // 2. Inicia el flujo de Facebook
);


// --- RUTAS DE CALLBACK (COMÚN PARA LOGIN Y VINCULACIÓN) ---
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const user = req.user;
    const accessTokenPayload = { id: user.id, username: user.username };
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshTokenPayload = { id: user.id };
    const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Redirige al frontend con un nuevo token. Si era una vinculación, la sesión se refresca.
    res.redirect(`http://localhost:8080/profile/connections?success=true&token=${accessToken}`);
  }
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const user = req.user;
    const accessTokenPayload = { id: user.id, username: user.username };
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshTokenPayload = { id: user.id };
    const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`http://localhost:8080/profile/connections?success=true&token=${accessToken}`);
  }
);


// --- OTRAS RUTAS ---
router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh-token', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify-email', authController.verifyEmail);

// Rutas protegidas
router.get('/profile', protect, authController.getProfile);
router.get('/login-history', protect, authController.getLoginHistoryController);

module.exports = router;