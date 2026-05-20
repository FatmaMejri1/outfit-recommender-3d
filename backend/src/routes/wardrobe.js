const express  = require('express');
const router   = express.Router();
const Wardrobe = require('../models/Wardrobe');
const Product  = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/wardrobe  — user's owned items
router.get('/', protect, async (req, res) => {
  try {
    const items = await Wardrobe.findAll({
      where:   { user_id: req.user.id },
      include: [{ model: Product }],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
