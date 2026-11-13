const express = require('express');
const router = express.Router();
const {
  submitInquiry,
  getInquiries,
  updateInquiryStatus
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/', submitInquiry);
router.get('/inquiries', protect, adminOnly, getInquiries);
router.put('/inquiries/:id', protect, adminOnly, updateInquiryStatus);

module.exports = router;

