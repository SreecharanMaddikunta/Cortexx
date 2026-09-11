const express = require('express');
const router = express.Router();
const { processScan, getScanHistory } = require('../controllers/scanController');

// In a real app, these should have an authMiddleware to get req.user
router.post('/process', processScan);
router.get('/history', getScanHistory);

module.exports = router;
