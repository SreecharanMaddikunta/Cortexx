const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { 
  getFarmerProfile, 
  getCrops, 
  addCrop, 
  deleteCrop,
  getTasks,
  completeTask,
  getAlerts 
} = require('../controllers/farmerController');

// Protect all farmer routes
router.use(verifyToken);

router.get('/profile', getFarmerProfile);

// Crop Management
router.get('/crops', getCrops);
router.post('/crops', addCrop);
router.delete('/crops/:id', deleteCrop);

// Tasks & Alerts
router.get('/tasks', getTasks);
router.post('/tasks/:id/complete', completeTask);
router.get('/alerts', getAlerts);

module.exports = router;
