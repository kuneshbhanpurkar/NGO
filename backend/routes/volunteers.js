const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// Get all volunteer profiles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const volunteers = await prisma.user.findMany({
      where: { role: 'volunteer' },
      select: {
        id: true,
        name: true,
        email: true,
        area: true,
        createdAt: true
      }
    });
    res.json(volunteers);
  } catch (error) {
    console.error('Fetch volunteers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
