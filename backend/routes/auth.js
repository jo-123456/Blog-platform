const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { get, run } = require('../db/database');
const { auth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    if (get('SELECT id FROM users WHERE email = ?', [email]))
      return res.status(400).json({ error: 'Email already registered' });

    if (get('SELECT id FROM users WHERE username = ?', [username]))
      return res.status(400).json({ error: 'Username taken' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    run(
      'INSERT INTO users (id, username, email, password, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [id, username, email, hashed, avatarUrl, bio || '']
    );

    const user = get('SELECT id, username, email, avatar, bio, role, created_at FROM users WHERE id = ?', [id]);
    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    delete user.password;
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  const user = get('SELECT id, username, email, avatar, bio, role, created_at FROM users WHERE id = ?', [req.user.id]);
  res.json(user);
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    if (username && username !== req.user.username) {
      const existing = get('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.user.id]);
      if (existing) return res.status(400).json({ error: 'Username taken' });
    }
    run(
      'UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar) WHERE id = ?',
      [username || null, bio !== undefined ? bio : null, avatar || null, req.user.id]
    );
    const updated = get('SELECT id, username, email, avatar, bio, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
