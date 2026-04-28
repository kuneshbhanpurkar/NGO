const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// Count problems grouped by area
router.get('/by-area', authMiddleware, roleMiddleware(['admin', 'ngo']), async (req, res) => {
  try {
    const counts = await prisma.problem.groupBy({
      by: ['area'],
      _count: {
        id: true
      }
    });
    res.json(counts);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Count problems grouped by category
router.get('/by-category', authMiddleware, roleMiddleware(['admin', 'ngo']), async (req, res) => {
  try {
    const counts = await prisma.problem.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });
    res.json(counts);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
