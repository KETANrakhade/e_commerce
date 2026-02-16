const express = require('express');
const router = express.Router();
const {
  submitReturnRequest,
  submitExchangeRequest,
  submitSupportRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/customerCareController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/support', submitSupportRequest);

// Protected routes (require authentication)
router.post('/return', protect, submitReturnRequest);
router.post('/exchange', protect, submitExchangeRequest);
router.get('/my-requests', protect, getMyRequests);

// Admin routes
router.get('/admin/requests', protect, admin, getAllRequests);
router.put('/admin/requests/:id', protect, admin, updateRequestStatus);

module.exports = router;
