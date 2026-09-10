const express = require('express');
const router = express.Router();
const { processScan, getScanHistory, deleteScan } = require('../controllers/scanController');

// In a real app, these should have an authMiddleware to get req.user
router.post('/process', processScan);
router.get('/history', getScanHistory);
router.delete('/:id', deleteScan);

module.exports = router;
