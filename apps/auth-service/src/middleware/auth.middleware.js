const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraer el token de la cabecera 'Bearer <token>'
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Añadir el payload del usuario al objeto request.
      // Nuestro payload contiene { id, username }, por lo que lo adjuntamos como req.user
      req.user = decoded;

      next(); // La petición puede continuar
    } catch (error) {
      console.error('Error en la autenticación del token:', error.message);
      return res.status(401).json({ message: 'Token no es válido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
};

module.exports = { protect };