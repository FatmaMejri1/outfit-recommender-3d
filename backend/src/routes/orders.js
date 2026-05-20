const express    = require('express');
const router     = express.Router();
const Order      = require('../models/Order');
const OrderItem  = require('../models/OrderItem');
const Wardrobe   = require('../models/Wardrobe');
const Commission = require('../models/Commission');
const User       = require('../models/User');
const { protect } = require('../middleware/auth');

const COMMISSION_RATE = 0.05;

// POST /api/orders  — place an order
router.post('/', protect, async (req, res) => {
  try {
    const { items, referral_code } = req.body;
    // items: [{ product_id, quantity, unit_price, size }]

    const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

    // Resolve referrer
    let referrer = null;
    if (referral_code) {
      referrer = await User.findOne({ where: { referral_code } });
    }

    const order = await Order.create({
      user_id:     req.user.id,
      total_amount: total,
      status:      'paid',
      referred_by: referrer?.id || null,
    });

    // Create items + add to wardrobe
    for (const item of items) {
      await OrderItem.create({ ...item, order_id: order.id });
      await Wardrobe.findOrCreate({
        where: { user_id: req.user.id, product_id: item.product_id },
      });
    }

    // Update user behavior context
    await req.user.update({
      total_orders: (req.user.total_orders || 0) + 1,
      last_category:     items[0]?.category     || req.user.last_category,
      last_product_type: items[0]?.product_type || req.user.last_product_type,
      days_since_last_order: 0,
    });

    // Commission
    if (referrer) {
      const amount = parseFloat((total * COMMISSION_RATE).toFixed(2));
      await Commission.create({ referrer_id: referrer.id, order_id: order.id, amount });
      await User.increment('total_commission', { by: amount, where: { id: referrer.id } });
    }

    res.status(201).json({ order_id: order.id, total, status: 'paid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
