const sql = require('mssql');

const config = {
  server: process.env.DB_HOST || 'sqlserver',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'food_recipe_db',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('[DB] recipe-service connected to SQL Server');
  }
  return pool;
}

module.exports = { getPool, sql };
