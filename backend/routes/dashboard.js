const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// Get Dashboard Stats (NGO / Admin)
router.get('/stats', authMiddleware, roleMiddleware(['ADMIN', 'NGO']), async (req, res) => {
  try {
    const problems = await prisma.problem.findMany();
    
    // Calculate category counts
    const categoryCounts = problems.reduce((acc, problem) => {
      acc[problem.category] = (acc[problem.category] || 0) + 1;
      return acc;
    }, {});

    // Area Heatmap Data
    const areaCounts = problems.reduce((acc, problem) => {
      acc[problem.area] = (acc[problem.area] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalProblems: problems.length,
      categoryCounts,
      areaCounts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Suggestion mock (Claude Integration)
router.post('/suggest-volunteers', authMiddleware, roleMiddleware(['NGO']), async (req, res) => {
  try {
    const { problemId } = req.body;
    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Mock AI Response based on problem area and category
    // In a real scenario, we'd send problem data to Claude API and parse response
    const volunteers = await prisma.volunteerProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      where: {
        availability: true,
        location: problem.area // basic match for mock
      },
      take: 3
    });

    res.json({
      suggestions: volunteers,
      ai_reasoning: `Based on the location '${problem.area}', these volunteers are best suited.`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
