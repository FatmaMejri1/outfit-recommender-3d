require('dotenv').config();

module.exports = {
  secret:    process.env.JWT_SECRET || 'fallback_secret',
  expiresIn: '7d',
};
