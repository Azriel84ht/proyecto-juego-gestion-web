const { Pool } = require('pg');

// Crea un pool de conexiones usando las variables de entorno.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.PGPORT,
});

/**
 * Realiza una consulta simple para verificar la conexión con la base de datos.
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos exitosa. Hora del servidor:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
  }
};

// Exporta el pool para que pueda ser usado en otros módulos para hacer consultas.
module.exports = {
  query: (text, params) => pool.query(text, params),
  testConnection,
};