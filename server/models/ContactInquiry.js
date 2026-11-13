const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['General Question', 'Trip Planning Help', 'Travel Partner Issue', 'Community Feedback', 'Partnership', 'Bug Report'],
      default: 'General Question' 
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending'
    },
    adminNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.ContactInquiry || mongoose.model('ContactInquiry', contactInquirySchema);

