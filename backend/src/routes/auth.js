const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { secret, expiresIn } = require('../config/jwt');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, gender,
      height, weight, shoulder, chest, waist, hips,
    } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const referral_code = uuidv4().slice(0, 8).toUpperCase();

    const user = await User.create({
      name, email, password: hashed, gender,
      height, weight, shoulder, chest, waist, hips,
      referral_code,
    });

    const token = jwt.sign({ id: user.id }, secret, { expiresIn });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, referral_code } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, secret, { expiresIn });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  — get current user profile
router.get('/me', protect, async (req, res) => {
  const { password, ...user } = req.user.dataValues;
  res.json(user);
});

// PUT /api/auth/measurements  — update body measurements
router.put('/measurements', protect, async (req, res) => {
  try {
    const { height, weight, shoulder, chest, waist, hips } = req.body;
    await req.user.update({ height, weight, shoulder, chest, waist, hips });
    res.json({ message: 'Measurements updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;