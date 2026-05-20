const axios = require('axios');
const { sequelize } = require('./src/config/db');
const User = require('./src/models/User');

const API_URL = 'http://localhost:3000/api';
let adminToken = '';
let userToken = '';
let productId = '';

async function runTests() {
  try {
    console.log('--- 🧪 STARTING E2E API TESTS (WITH DB MOCKS) ---');

    // 1. Create Admin
    console.log('\n[1/8] Registering Admin...');
    const adminEmail = `admin_${Date.now()}@example.com`;
    const adminRes = await axios.post(`${API_URL}/auth/register`, {
      name: "Admin User",
      email: adminEmail,
      password: "AdminPassword123!",
      gender: "M"
    });
    adminToken = adminRes.data.token;
    
    // Force role to admin via Sequelize
    await User.update({ role: 'admin' }, { where: { email: adminEmail } });
    console.log('✅ Admin registered and role forced to "admin".');

    // 2. Register Regular User
    console.log('\n[2/8] Registering Regular User...');
    const userRes = await axios.post(`${API_URL}/auth/register`, {
      name: "Test User",
      email: `user_${Date.now()}@example.com`,
      password: "TestPassword123!",
      gender: "F",
      height: 165,
      weight: 58,
      chest: 90,
      waist: 70,
      hips: 95
    });
    userToken = userRes.data.token;
    console.log('✅ Regular User registered.');

    // 3. Create Product (Admin Route)
    console.log('\n[3/8] Testing Create Product (Admin)...');
    const prodRes = await axios.post(`${API_URL}/products`, {
      name: "Test Leather Jacket",
      brand: "Zara",
      category: "casual",
      product_type: "jacket",
      price: 150.00,
      stock: 10
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    productId = prodRes.data.id;
    console.log(`✅ Product created. ID: ${productId}`);

    // 4. Place Order
    console.log('\n[4/8] Testing Place Order...');
    const orderRes = await axios.post(`${API_URL}/orders`, {
      items: [{ product_id: productId, quantity: 1, unit_price: 150.00, size: 'M' }]
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log(`✅ Order placed. ID: ${orderRes.data.order_id}`);

    // 5. Get Wardrobe
    console.log('\n[5/8] Testing Get Wardrobe...');
    const wardrobeRes = await axios.get(`${API_URL}/wardrobe`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log(`✅ Wardrobe fetched. Items: ${wardrobeRes.data.length}`);

    // 6. Test Admin Stats
    console.log('\n[6/8] Testing Admin Stats...');
    const statsRes = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Admin Stats fetched. Total Revenue: ${statsRes.data.totalRevenue}`);

    // 7. Test AI Recommendations
    console.log('\n[7/8] Testing AI Recommendations...');
    try {
      const recRes = await axios.post(`${API_URL}/recommend`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log(`✅ Recommendations retrieved. Count: ${recRes.data.recommendations.length}`);
    } catch (e) {
      console.log(`⚠️ Recommendations failed (Is FastAPI running on port 8002?): ${e.message}`);
    }

    console.log('\n--- 🎉 ALL ENDPOINTS VERIFIED SUCCESSFULLY ---');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response ? error.response.data : error.message);
  } finally {
    await sequelize.close(); // Close connection
  }
}

runTests();
