const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/db');

const authRoutes      = require('./src/routes/auth');
const productRoutes   = require('./src/routes/products');
const orderRoutes     = require('./src/routes/orders');
const recommendRoutes = require('./src/routes/recommend');
const wardrobeRoutes  = require('./src/routes/wardrobe');
const adminRoutes     = require('./src/routes/admin');

const swaggerUi       = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs',      swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/wardrobe',  wardrobeRoutes);
app.use('/api/admin',     adminRoutes);

// Import models to define associations
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const OrderItem = require('./src/models/OrderItem');
const Wardrobe = require('./src/models/Wardrobe');
const Commission = require('./src/models/Commission');

// Define associations for Sequelize Eager Loading
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Wardrobe.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Wardrobe, { foreignKey: 'product_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

Order.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id' });

Wardrobe.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Wardrobe, { foreignKey: 'user_id' });

Commission.belongsTo(User, { foreignKey: 'referrer_id', as: 'referrer' });
Commission.belongsTo(Order, { foreignKey: 'order_id' });

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced');
  app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
}).catch(err => console.error('❌ DB sync failed:', err));
