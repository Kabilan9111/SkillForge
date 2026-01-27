require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  db: {
    path: process.env.DB_PATH || './database.sqlite'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*' // Allow all origins in development (file:// URLs included)
  }
};

module.exports = config;
