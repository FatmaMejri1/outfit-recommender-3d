const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Commission = sequelize.define('Commission', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  referrer_id: { type: DataTypes.INTEGER, allowNull: false },
  order_id:    { type: DataTypes.INTEGER, allowNull: false },
  amount:      { type: DataTypes.FLOAT,   allowNull: false },
  status:      { type: DataTypes.ENUM('pending','paid'), defaultValue: 'pending' },
});

module.exports = Commission;
