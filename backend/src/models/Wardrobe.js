const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Wardrobe = sequelize.define('Wardrobe', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  added_at:   { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
});

module.exports = Wardrobe;
