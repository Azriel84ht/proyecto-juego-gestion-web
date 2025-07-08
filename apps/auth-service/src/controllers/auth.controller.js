const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken
const userService = require('../services/user.service');

// --- Función 'register' existente (sin cambios) ---
const register = async (req, res) => {
  // ... código de la función register
};


// --- INICIO DE LA NUEVA FUNCIÓN 'login' ---

const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validar que los campos no estén vacíos
  if (!email || !password) {
    return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
  }

  try {
    // 2. Buscar al usuario por su email usando el servicio existente
    const user = await userService.findUserByEmailOrUsername(email, null);

    // 3. Si no hay usuario, las credenciales son inválidas
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 4. Comparar la contraseña con el hash almacenado
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // La contraseña no coincide, pero damos el mismo mensaje genérico
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 5. Si todo es correcto, generar el JWT
    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    // 6. Devolver el token al cliente
    return res.status(200).json({ token: token });

  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- FIN DE LA NUEVA FUNCIÓN 'login' ---


module.exports = {
  register,
  login, // Exportar la nueva función
};