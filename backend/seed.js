const { sequelize } = require('./src/config/db');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const OrderItem = require('./src/models/OrderItem');
const Wardrobe = require('./src/models/Wardrobe');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting Database Seeding...');
    
    // 1. Sync Database (Force drop tables and recreate)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables reset.');

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const users = await User.bulkCreate([
      {
        name: 'Admin User', email: 'admin@marketplace.com', password: passwordHash, role: 'admin', gender: 'Other',
        referral_code: 'ADMIN999'
      },
      {
        name: 'Emma Watson', email: 'emma@example.com', password: passwordHash, role: 'user', gender: 'F',
        height: 165, weight: 55, chest: 86, waist: 66, hips: 91, shoulder: 38,
        total_orders: 5, last_category: 'casual', referral_code: 'EMMA123'
      },
      {
        name: 'Chris Evans', email: 'chris@example.com', password: passwordHash, role: 'user', gender: 'M',
        height: 183, weight: 88, chest: 109, waist: 84, hips: 100, shoulder: 48,
        total_orders: 2, last_category: 'sportswear', referral_code: 'CHRIS456'
      },
      {
        name: 'Zendaya', email: 'zendaya@example.com', password: passwordHash, role: 'user', gender: 'F',
        height: 178, weight: 59, chest: 87, waist: 63, hips: 89, shoulder: 39,
        total_orders: 12, last_category: 'formal', referral_code: 'ZEN789'
      },
      {
        name: 'Tom Holland', email: 'tom@example.com', password: passwordHash, role: 'user', gender: 'M',
        height: 173, weight: 65, chest: 96, waist: 76, hips: 92, shoulder: 43,
        total_orders: 3, last_category: 'casual', referral_code: 'TOM000'
      }
    ]);
    console.log(`✅ Created ${users.length} Users (Password for all: "password123").`);

    // 3. Create Products
    const products = await Product.bulkCreate([
      {
        name: 'Classic White T-Shirt', brand: 'Essentials', category: 'casual', product_type: 't-shirt',
        description: 'A breathable cotton classic white t-shirt suitable for everyday wear.',
        price: 25.00, stock: 100,
        size_chest_min: 85, size_chest_max: 110, size_waist_min: 70, size_waist_max: 95, size_hip_min: 80, size_hip_max: 105
      },
      {
        name: 'Slim Fit Denim Jeans', brand: 'Levi', category: 'casual', product_type: 'jeans',
        description: 'Dark wash slim fit denim jeans with slight stretch.',
        price: 65.00, stock: 50,
        size_chest_min: 0, size_chest_max: 0, size_waist_min: 60, size_waist_max: 90, size_hip_min: 85, size_hip_max: 115
      },
      {
        name: 'Tailored Black Blazer', brand: 'Zara', category: 'formal', product_type: 'jacket',
        description: 'A sharp, tailored black blazer perfect for office or evening wear.',
        price: 120.00, stock: 30,
        size_chest_min: 80, size_chest_max: 115, size_waist_min: 65, size_waist_max: 95, size_hip_min: 85, size_hip_max: 110
      },
      {
        name: 'Athletic Running Shorts', brand: 'Nike', category: 'sportswear', product_type: 'shorts',
        description: 'Lightweight, moisture-wicking shorts for high performance.',
        price: 35.00, stock: 80,
        size_chest_min: 0, size_chest_max: 0, size_waist_min: 65, size_waist_max: 100, size_hip_min: 80, size_hip_max: 115
      },
      {
        name: 'Floral Summer Dress', brand: 'H&M', category: 'casual', product_type: 'dress',
        description: 'A breezy floral dress perfect for summer days.',
        price: 45.00, stock: 40,
        size_chest_min: 80, size_chest_max: 100, size_waist_min: 60, size_waist_max: 85, size_hip_min: 85, size_hip_max: 105
      }
    ]);
    console.log(`✅ Created ${products.length} Products.`);

    // 4. Create Orders & Wardrobe Items
    // Emma buys Dress & T-shirt
    const order1 = await Order.create({ user_id: users[1].id, total_amount: 70.00, status: 'delivered' });
    await OrderItem.bulkCreate([
      { order_id: order1.id, product_id: products[4].id, quantity: 1, unit_price: 45.00, size: 'M' },
      { order_id: order1.id, product_id: products[0].id, quantity: 1, unit_price: 25.00, size: 'M' }
    ]);
    await Wardrobe.bulkCreate([
      { user_id: users[1].id, product_id: products[4].id },
      { user_id: users[1].id, product_id: products[0].id }
    ]);

    // Chris buys Blazer & Shorts
    const order2 = await Order.create({ user_id: users[2].id, total_amount: 155.00, status: 'shipped' });
    await OrderItem.bulkCreate([
      { order_id: order2.id, product_id: products[2].id, quantity: 1, unit_price: 120.00, size: 'L' },
      { order_id: order2.id, product_id: products[3].id, quantity: 1, unit_price: 35.00, size: 'L' }
    ]);
    await Wardrobe.bulkCreate([
      { user_id: users[2].id, product_id: products[2].id },
      { user_id: users[2].id, product_id: products[3].id }
    ]);

    console.log('✅ Created Orders, OrderItems, and Wardrobes.');
    console.log('\n🎉 Seeding Completed Successfully! You can now log in with email "admin@marketplace.com" and password "password123".');

  } catch (error) {
    console.error('❌ Seeding Failed:', error);
  } finally {
    await sequelize.close();
  }
};

seedData();
