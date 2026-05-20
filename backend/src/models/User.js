const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:     { type: DataTypes.STRING,  allowNull: false },
  email:    { type: DataTypes.STRING,  allowNull: false, unique: true },
  password: { type: DataTypes.STRING,  allowNull: false },
  role:     { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  gender:   { type: DataTypes.ENUM('M', 'F', 'Other') },

  // Body measurements (stored at signup, sent to FastAPI)
  height:   { type: DataTypes.FLOAT },
  weight:   { type: DataTypes.FLOAT },
  shoulder: { type: DataTypes.FLOAT },
  chest:    { type: DataTypes.FLOAT },
  waist:    { type: DataTypes.FLOAT },
  hips:     { type: DataTypes.FLOAT },

  // Behavioral context (updated after each order)
  total_orders:          { type: DataTypes.INTEGER, defaultValue: 0 },
  last_category:         { type: DataTypes.STRING,  defaultValue: 'casual' },
  last_product_type:     { type: DataTypes.STRING,  defaultValue: 't-shirt' },
  days_since_last_order: { type: DataTypes.INTEGER, defaultValue: 30 },

  // Commission system
  referral_code:     { type: DataTypes.STRING, unique: true },
  total_commission:  { type: DataTypes.FLOAT,  defaultValue: 0 },
});

module.exports = User;
