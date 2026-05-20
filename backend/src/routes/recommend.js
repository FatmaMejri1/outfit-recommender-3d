const express  = require('express');
const router   = express.Router();
const Product  = require('../models/Product');
const Order    = require('../models/Order');
const { protect } = require('../middleware/auth');
const { getRecommendations } = require('../services/aiProxy');

// POST /api/recommend
router.post('/', protect, async (req, res) => {
  try {
    const { search_query, category, product_type } = req.body;
    const user = req.user;

    // Fetch candidate products
    const where = {};
    if (category)     where.category     = category;
    if (product_type) where.product_type = product_type;
    const products = await Product.findAll({ where, limit: 20 });

    if (!products.length) return res.json({ recommendations: [] });

    // Call FastAPI AI service
    const aiResult = await getRecommendations({
      user:        user.dataValues,
      products:    products.map(p => p.dataValues),
      searchQuery: search_query,
    });

    // Merge AI scores with full product data
    const productMap = Object.fromEntries(products.map(p => [String(p.id), p.dataValues]));
    const enriched = aiResult.recommendations.map(rec => ({
      ...productMap[rec.product_id],
      ai_score:           rec.final_score,
      ai_explanation:     rec.explanation,
      return_probability: rec.return_probability,
      risk_data:          rec.risk_data,
    }));

    res.json({ recommendations: enriched });
  } catch (err) {
    console.error('Recommend error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
