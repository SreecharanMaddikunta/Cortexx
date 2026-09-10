const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, loginAdmin } = require('../controllers/authController');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/admin/login', loginAdmin);

module.exports = router;
