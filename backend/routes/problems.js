const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// Get all problems (admin/ngo only)
router.get('/', authMiddleware, roleMiddleware(['admin', 'ngo']), async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(problems);
  } catch (error) {
    console.error('Fetch problems error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new problem (user)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, area, category, description, photoUrl } = req.body;
    
    const problem = await prisma.problem.create({
      data: {
        userId: req.user.id,
        title,
        area,
        category,
        description,
        photoUrl,
      }
    });

    res.status(201).json(problem);
  } catch (error) {
    console.error('Create problem error details:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update problem status (admin only as per prompt, but maybe ngo too? prompt says admin)
router.patch('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    
    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(problem);
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

