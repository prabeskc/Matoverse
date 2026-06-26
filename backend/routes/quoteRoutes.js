const express = require('express');
const { submitQuote, getAllQuotes } = require('../controllers/quoteController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for file attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `quote-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for 3D model files
});

/**
 * POST /api/quotes
 * Public — Submit a "Request a Print Quote" form with optional file attachment.
 * Body: { name, email, subject, message }
 * File: file
 * Returns: { quoteId, status, message }
 */
router.post('/', upload.single('file'), submitQuote);

/**
 * GET /api/quotes
 * Protected (Admin) — List all quote requests.
 * Optional: ?status=Pending|Reviewed|Quoted|Resolved|Rejected
 *
 * NOTE: In production, add a role-check middleware here:
 *   router.get('/', authMiddleware, requireRole('admin'), getAllQuotes);
 */
router.get('/', authMiddleware, getAllQuotes);

module.exports = router;
