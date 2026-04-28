const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, area: true, created_at: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (Admin only)
router.put('/:id/role', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    // If role becomes VOLUNTEER, create empty profile if not exists
    if (role === 'VOLUNTEER') {
      const existingProfile = await prisma.volunteerProfile.findUnique({ where: { userId: user.id } });
      if (!existingProfile) {
        await prisma.volunteerProfile.create({
          data: {
            userId: user.id,
            location: user.area || '',
            skills: []
          }
        });
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
