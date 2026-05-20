const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id:   { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity:   { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.FLOAT,   allowNull: false },
  size:       { type: DataTypes.STRING },
});

module.exports = OrderItem;
