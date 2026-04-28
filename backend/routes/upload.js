const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/', (req, res) => {
  console.log('Upload request received.');
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
      const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(req.file.originalname || '.jpg');
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      
      const fileUrl = `${process.env.API_URL || 'http://localhost:4000'}/uploads/${filename}`;
      res.json({ url: fileUrl });
    } catch (writeErr) {
      console.error('File write error:', writeErr);
      res.status(500).json({ error: 'Failed to save file', details: writeErr.message });
    }
  });
});

module.exports = router;
