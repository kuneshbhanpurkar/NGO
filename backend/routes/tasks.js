const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// Get all tasks (for admin/ngo)
router.get('/', authMiddleware, roleMiddleware(['admin', 'ngo']), async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        problem: true,
        volunteer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks for logged-in volunteer
router.get('/mine', authMiddleware, roleMiddleware(['volunteer']), async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { volunteerId: req.user.id },
      include: {
        problem: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Fetch my tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task assignment (admin/ngo)
router.post('/', authMiddleware, roleMiddleware(['admin', 'ngo']), async (req, res) => {
  try {
    const { problemId, volunteerId, deadline, notes } = req.body;

    const task = await prisma.task.create({
      data: {
        problemId,
        volunteerId,
        deadline: deadline ? new Date(deadline) : null,
        notes,
        status: 'pending'
      }
    });

    // Update problem status to assigned
    await prisma.problem.update({
      where: { id: problemId },
      data: { status: 'assigned' }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const data = { status };
    if (status === 'completed') {
      data.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data
    });

    // If task is completed, maybe update problem status too
    if (status === 'completed') {
      await prisma.problem.update({
        where: { id: task.problemId },
        data: { status: 'completed' }
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Suggest volunteers using Gemini API
router.post('/suggest', authMiddleware, roleMiddleware(['admin', 'ngo']), async (req, res) => {
  try {
    const { problemId } = req.body;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });

    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const volunteers = await prisma.user.findMany({
      where: { role: 'volunteer' },
      select: { id: true, name: true, area: true }
    });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith('your_')) {
      return res.json(volunteers.slice(0, 3).map(v => ({ ...v, matchScore: 90, reason: "Mock recommendation (No Gemini key)" })));
    }

    const prompt = `You are an AI assistant for an NGO coordination platform.
    Given this problem: "${problem.description}" in area "${problem.area}".
    And these available volunteers: ${JSON.stringify(volunteers)}.
    
    Suggest the top 3 best matching volunteers based on their area and potential skills.
    Return ONLY a valid JSON array of objects with these fields: id, name, matchScore (0-100), and reason.
    Do not include any other text or markdown formatting.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Remove potential markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const suggestions = JSON.parse(text);
      res.json(suggestions);
    } catch (parseError) {
      console.error('Gemini parse error:', parseError, 'Raw text:', text);
      res.status(500).json({ error: 'Failed to parse AI suggestions', raw: text });
    }

  } catch (error) {
    console.error('Gemini suggest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;

