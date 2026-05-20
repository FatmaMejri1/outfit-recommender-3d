const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:         { type: DataTypes.STRING,  allowNull: false },
  brand:        { type: DataTypes.STRING },
  category:     { type: DataTypes.STRING },
  product_type: { type: DataTypes.STRING },
  description:  { type: DataTypes.TEXT },
  price:        { type: DataTypes.FLOAT,   allowNull: false },
  image_url:    { type: DataTypes.STRING },
  model_3d_url: { type: DataTypes.STRING },  // GLB file path for Three.js

  // Size range — sent to FastAPI fit-score engine
  size_chest_min: { type: DataTypes.FLOAT, defaultValue: 0 },
  size_chest_max: { type: DataTypes.FLOAT, defaultValue: 0 },
  size_waist_min: { type: DataTypes.FLOAT, defaultValue: 0 },
  size_waist_max: { type: DataTypes.FLOAT, defaultValue: 0 },
  size_hip_min:   { type: DataTypes.FLOAT, defaultValue: 0 },
  size_hip_max:   { type: DataTypes.FLOAT, defaultValue: 0 },

  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Product;
