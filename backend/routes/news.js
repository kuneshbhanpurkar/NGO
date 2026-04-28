const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// Get all news items
router.get('/', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' }
    });
    res.json(news);
  } catch (error) {
    console.error('Fetch news error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create news item (admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;
    
    const newsItem = await prisma.news.create({
      data: {
        title,
        body,
        imageUrl
      }
    });

    res.status(201).json(newsItem);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
