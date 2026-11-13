const Store = require('../utils/store');

// @desc Submit a new contact inquiry
// @route POST /api/contact
const submitInquiry = async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All required contact fields must be provided' });
    }

    const inquiry = await Store.inquiries.create({
      name,
      email,
      subject,
      category: category || 'General Question',
      message
    });

    res.status(201).json({
      message: 'Thank you for reaching out! The Traverse team has received your message.',
      inquiry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting inquiry', error: error.message });
  }
};

// @desc Get all inquiries (Admin only)
// @route GET /api/contact/inquiries
const getInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const inquiries = await Store.inquiries.find(status ? { status } : {});
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving inquiries', error: error.message });
  }
};

// @desc Update inquiry status / notes (Admin only)
// @route PUT /api/contact/inquiries/:id
const updateInquiryStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const inquiry = await Store.inquiries.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updated = await Store.inquiries.findByIdAndUpdate(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating inquiry', error: error.message });
  }
};

module.exports = {
  submitInquiry,
  getInquiries,
  updateInquiryStatus
};

