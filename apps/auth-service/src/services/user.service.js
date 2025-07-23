const db = require('../config/db');
const geoip = require('fast-geoip'); // <-- CAMBIADO

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

const geoip = require('geoip-lite');

const addLoginHistory = async (userId, ipAddress, userAgent, deviceInfo) => {
  const geo = await geoip.lookup(ipAddress); // <-- AÑADIDO 'await'
  const location = geo ? `${geo.city}, ${geo.country}` : 'Desconocida';

  const query = {
    text: `INSERT INTO login_history (user_id, ip_address, user_agent, device_info, location) VALUES ($1, $2, $3, $4, $5)`,
    values: [userId, ipAddress, userAgent, deviceInfo, location],
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

const findUserByFacebookId = async (facebookId) => {
  const { rows } = await db.query('SELECT * FROM users WHERE facebook_id = $1', [facebookId]);
  return rows[0];
};

const findUserByPasswordResetToken = async (hashedToken) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_token_expires > NOW()',
    [hashedToken]
  );
  return rows[0];
};

const findUserById = async (id) => {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
};

const deleteUserById = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

const findUserByPasswordResetToken = async (hashedToken) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_token_expires > NOW()',
    [hashedToken]
  );
  return rows[0];
};

const findUserById = async (id) => {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
};

const deleteUserById = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  findUserByEmailOrUsername,
  createUser,
  updateUserById,
  findUserByVerificationToken,
  addLoginHistory,
  getLoginHistory,
  findUserByGoogleId,
  findUserByFacebookId,
  findUserByPasswordResetToken,
  findUserById,
  deleteUserById,
};