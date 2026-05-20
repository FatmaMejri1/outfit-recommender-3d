const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  total_amount: { type: DataTypes.FLOAT,   allowNull: false },
  status: {
    type: DataTypes.ENUM('pending','paid','shipped','delivered','returned'),
    defaultValue: 'pending',
  },
  referred_by: { type: DataTypes.INTEGER, defaultValue: null }, // user_id of referrer
});

module.exports = Order;
