const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/products  — public, filterable
router.get('/', async (req, res) => {
  try {
    const where = {};
    ['category', 'brand', 'product_type'].forEach(f => {
      if (req.query[f]) where[f] = req.query[f];
    });
    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id  — public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products  — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id  — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id  — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
