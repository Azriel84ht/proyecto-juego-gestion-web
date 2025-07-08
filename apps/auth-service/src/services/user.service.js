const db = require('../config/db');

/**
 * Busca un usuario por su email o username.
 * @param {string} email - El email del usuario.
 * @param {string} username - El nombre de usuario.
 * @returns {Promise<Object|null>} El usuario encontrado o null.
 */
const findUserByEmailOrUsername = async (email, username) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  return rows[0];
};

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {string} username - El nombre de usuario.
 * @param {string} email - El email del usuario.
 * @param {string} passwordHash - El hash de la contraseña.
 * @returns {Promise<Object>} El usuario creado (sin el hash de la contraseña).
 */
const createUser = async (username, email, passwordHash) => {
  const { rows } = await db.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
    [username, email, passwordHash]
  );
  return rows[0];
};

module.exports = {
  findUserByEmailOrUsername,
  createUser,
};