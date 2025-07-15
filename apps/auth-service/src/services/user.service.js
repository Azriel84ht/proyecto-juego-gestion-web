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

const updateUserById = async (userId, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');

  const query = {
    text: `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
    values: [userId, ...values],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

const findUserByVerificationToken = async (hashedToken) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
    [hashedToken]
  );
  return rows[0];
};

// --- INICIO DE NUEVAS FUNCIONES ---

/**
 * Añade un registro al historial de login de un usuario.
 * @param {string} userId
 * @param {string} ipAddress
 * @param {string} userAgent
 * @param {string} deviceInfo
 */
const addLoginHistory = async (userId, ipAddress, userAgent, deviceInfo) => {
  const query = {
    text: `INSERT INTO login_history (user_id, ip_address, user_agent, device_info) VALUES ($1, $2, $3, $4)`,
    values: [userId, ipAddress, userAgent, deviceInfo],
  };
  await db.query(query);
};

/**
 * Obtiene el historial de login de un usuario.
 * @param {string} userId
 * @returns {Promise<Array>} Un array con el historial de logins.
 */
const getLoginHistory = async (userId) => {
  const query = {
    text: 'SELECT * FROM login_history WHERE user_id = $1 ORDER BY login_timestamp DESC',
    values: [userId],
  };
  const { rows } = await db.query(query);
  return rows;
};

// --- FIN DE NUEVAS FUNCIONES ---

module.exports = {
  findUserByEmailOrUsername,
  createUser,
  updateUserById,
  findUserByVerificationToken,
  addLoginHistory, // <-- Añadido
  getLoginHistory, // <-- Añadido
};