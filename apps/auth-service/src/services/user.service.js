const db = require('../config/db');

const findUserByEmailOrUsername = async (email, username) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  return rows[0];
};

const createUser = async (username, email, passwordHash) => {
  const { rows } = await db.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
    [username, email, passwordHash]
  );
  return rows[0];
};

// --- INICIO DE NUEVAS FUNCIONES ---

/**
 * Actualiza campos específicos de un usuario por su ID.
 * @param {string} userId - El ID del usuario a actualizar.
 * @param {Object} fields - Un objeto con los campos y valores a actualizar. ej: { is_verified: true }
 * @returns {Promise<Object>} El usuario actualizado.
 */
const updateUserById = async (userId, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  // Construye la parte SET de la consulta dinámicamente: "is_verified" = $2, "verification_token" = $3
  const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');

  const query = {
    text: `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
    values: [userId, ...values],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * Busca un usuario por su token de verificación hasheado y no expirado.
 * @param {string} hashedToken - El token hasheado.
 * @returns {Promise<Object|null>} El usuario encontrado o null.
 */
const findUserByVerificationToken = async (hashedToken) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
    [hashedToken]
  );
  return rows[0];
};

// --- FIN DE NUEVAS FUNCIONES ---

module.exports = {
  findUserByEmailOrUsername,
  createUser,
  updateUserById, // <-- Añadido
  findUserByVerificationToken, // <-- Añadido
};