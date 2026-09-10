const express = require('express');
const { 
  getMapData, 
  getReports, 
  getFarmers, 
  getAlerts, 
  createAlert, 
  deleteAlert,
  getAnalyticsStats,
  exportAnalyticsCSV
} = require('../controllers/adminController');

const router = express.Router();

// Real-time synchronization endpoints
router.get('/map', getMapData);
router.get('/reports', getReports);
router.get('/farmers', getFarmers);
router.get('/alerts', getAlerts);
router.post('/alert', createAlert);
router.delete('/alerts/:id', deleteAlert);

// Analytics endpoints
router.get('/analytics/stats', getAnalyticsStats);
router.get('/analytics/export', exportAnalyticsCSV);

module.exports = router;
