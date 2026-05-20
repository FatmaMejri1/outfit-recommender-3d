const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const Order      = require('../models/Order');
const Commission = require('../models/Commission');
const Product    = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalRevenue, pendingCommissions] = await Promise.all([
      User.count(),
      Order.count(),
      Order.sum('total_amount', { where: { status: 'paid' } }),
      Commission.sum('amount',  { where: { status: 'pending' } }),
    ]);
    res.json({ totalUsers, totalOrders, totalRevenue: totalRevenue || 0, pendingCommissions: pendingCommissions || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  try {
    await Order.update({ status: req.body.status }, { where: { id: req.params.id } });
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/commissions
router.get('/commissions', async (req, res) => {
  try {
    const commissions = await Commission.findAll();
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/commissions/:id/pay
router.put('/commissions/:id/pay', async (req, res) => {
  try {
    await Commission.update({ status: 'paid' }, { where: { id: req.params.id } });
    res.json({ message: 'Commission paid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
