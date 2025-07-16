const db = require('../config/db');

const findUserByEmailOrUsername = async (email, username) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  return rows[0];
};

const createUser = async (userData) => {
  const columns = Object.keys(userData);
  const values = Object.values(userData);
  const valuePlaceholders = values.map((_, index) => `$${index + 1}`).join(', ');

  const queryText = `
    INSERT INTO users (${columns.join(', ')}) 
    VALUES (${valuePlaceholders}) 
    RETURNING id, username, email, created_at, is_verified, avatar_url
  `;

  const { rows } = await db.query(queryText, values);
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

const addLoginHistory = async (userId, ipAddress, userAgent, deviceInfo) => {
  const query = {
    text: `INSERT INTO login_history (user_id, ip_address, user_agent, device_info) VALUES ($1, $2, $3, $4)`,
    values: [userId, ipAddress, userAgent, deviceInfo],
  };
  await db.query(query);
};

const getLoginHistory = async (userId) => {
  const query = {
    text: 'SELECT * FROM login_history WHERE user_id = $1 ORDER BY login_timestamp DESC',
    values: [userId],
  };
  const { rows } = await db.query(query);
  return rows;
};

const findUserByGoogleId = async (googleId) => {
  const { rows } = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return rows[0];
};

// --- INICIO DE NUEVA FUNCIÓN ---
/**
 * Busca a un usuario por su ID de Facebook.
 * @param {string} facebookId - El ID de perfil de Facebook.
 * @returns {Promise<Object|null>} El usuario encontrado o null.
 */
const findUserByFacebookId = async (facebookId) => {
  const { rows } = await db.query('SELECT * FROM users WHERE facebook_id = $1', [facebookId]);
  return rows[0];
};
// --- FIN DE NUEVA FUNCIÓN ---

module.exports = {
  findUserByEmailOrUsername,
  createUser,
  updateUserById,
  findUserByVerificationToken,
  addLoginHistory,
  getLoginHistory,
  findUserByGoogleId,
  findUserByFacebookId, // <-- Añadido
};