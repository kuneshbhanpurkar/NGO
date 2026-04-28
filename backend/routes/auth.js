const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, area } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        area
      }
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, area: user.area },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, area: user.area } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

