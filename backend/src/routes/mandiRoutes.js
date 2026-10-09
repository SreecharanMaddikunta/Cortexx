const express = require('express');
const router = express.Router();
const {
  getMandiPrices,
  saveSellingEstimate,
  getSellingEstimates,
  deleteSellingEstimate,
  optimizeProfit
} = require('../controllers/mandiController');

const { verifyToken } = require('../middlewares/auth');

router.get('/prices', verifyToken, getMandiPrices);
router.post('/optimize', verifyToken, optimizeProfit);
router.post('/estimates', verifyToken, saveSellingEstimate);
router.get('/estimates', verifyToken, getSellingEstimates);
router.delete('/estimates/:id', verifyToken, deleteSellingEstimate);

module.exports = router;
