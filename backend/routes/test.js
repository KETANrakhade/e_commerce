const router = require('express').Router();
const fs = require('fs');
const path = require('path');

// @desc    Get latest emails (for development testing)
// @route   GET /api/test/emails
// @access  Public (only in development)
router.get('/emails', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }

  try {
    const logPath = path.join(__dirname, '../temp-emails.json');
    if (!fs.existsSync(logPath)) {
      return res.json({ emails: [] });
    }

    const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    res.json({ emails: logs });
  } catch (error) {
    console.error('Error reading email logs:', error);
    res.status(500).json({ error: 'Failed to read email logs' });
  }
});

// @desc    Get latest OTP from emails
// @route   GET /api/test/latest-otp/:email
// @access  Public (only in development)
router.get('/latest-otp/:email', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }

  try {
    const { email } = req.params;
    const logPath = path.join(__dirname, '../temp-emails.json');
    
    if (!fs.existsSync(logPath)) {
      return res.json({ otp: null, message: 'No emails found' });
    }

    const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    
    // Find the latest OTP email for this email address
    const otpEmail = logs
      .filter(log => log.to === email && log.subject.includes('OTP'))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    if (!otpEmail) {
      return res.json({ otp: null, message: 'No OTP email found for this address' });
    }

    // Extract OTP from content (6 digits)
    const otpMatch = otpEmail.content.match(/\b\d{6}\b/);
    const otp = otpMatch ? otpMatch[0] : null;

    res.json({ 
      otp, 
      timestamp: otpEmail.timestamp,
      message: otp ? 'OTP found' : 'OTP not found in email content'
    });
  } catch (error) {
    console.error('Error extracting OTP:', error);
    res.status(500).json({ error: 'Failed to extract OTP' });
  }
});

module.exports = router;