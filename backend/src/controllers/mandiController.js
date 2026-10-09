const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DATA_GOV_IN_RESOURCE_ID = process.env.DATA_GOV_IN_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';

exports.getMandiPrices = async (req, res) => {
  try {
    const { 
      commodity, 
      state, 
      district, 
      market, 
      limit = 100, 
      offset = 0,
      demo = 'false'
    } = req.query;

    if (demo === 'true') {
      return res.json({
        records: [
          {
            commodity: commodity || 'Tomato',
            state: state || 'Punjab',
            district: district || 'Amritsar',
            market: market || 'Ajnala',
            arrivalDate: new Date().toLocaleDateString('en-GB'),
            minPrice: 2000,
            maxPrice: 2500,
            modalPrice: 2200,
            unit: '₹/quintal',
            source: 'Mock Data (Demo Mode)',
            retrievedAt: new Date().toISOString()
          },
          {
            commodity: commodity || 'Tomato',
            state: state || 'Punjab',
            district: district || 'Amritsar',
            market: market || 'Tarn Taran',
            arrivalDate: new Date().toLocaleDateString('en-GB'),
            minPrice: 2100,
            maxPrice: 2600,
            modalPrice: 2350,
            unit: '₹/quintal',
            source: 'Mock Data (Demo Mode)',
            retrievedAt: new Date().toISOString()
          },
          {
            commodity: commodity || 'Onion',
            state: state || 'Maharashtra',
            district: district || 'Nashik',
            market: market || 'Lasalgaon',
            arrivalDate: new Date(Date.now() - 86400000).toLocaleDateString('en-GB'), // yesterday
            minPrice: 1500,
            maxPrice: 1900,
            modalPrice: 1700,
            unit: '₹/quintal',
            source: 'Mock Data (Demo Mode)',
            retrievedAt: new Date().toISOString()
          }
        ].filter(r => !commodity || r.commodity.toLowerCase() === commodity.toLowerCase()),
        total: 3,
        count: 3,
        offset: 0
      });
    }

    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'API_KEY_MISSING',
        message: 'Market data is currently unavailable. Please configure DATA_GOV_IN_API_KEY in the environment.'
      });
    }

    let url = `https://api.data.gov.in/resource/${DATA_GOV_IN_RESOURCE_ID}?api-key=${apiKey}&format=json&limit=${limit}&offset=${offset}`;

    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
    if (market) url += `&filters[market]=${encodeURIComponent(market)}`;

    // Optional: Sort by arrival_date desc if the API supports it, though often it doesn't support complex sorting natively.
    // We'll let the frontend sort it or we can pass sort[arrival_date]=desc.

    const response = await axios.get(url, { timeout: 10000 });
    
    // Normalize data
    const records = response.data.records.map(record => ({
      commodity: record.commodity,
      state: record.state,
      district: record.district,
      market: record.market,
      arrivalDate: record.arrival_date,
      minPrice: parseFloat(record.min_price) || 0,
      maxPrice: parseFloat(record.max_price) || 0,
      modalPrice: parseFloat(record.modal_price) || 0,
      unit: '₹/quintal', // Standard for this API
      source: 'data.gov.in (AGMARKNET)',
      retrievedAt: new Date().toISOString()
    }));

    res.json({
      records,
      total: response.data.total,
      count: response.data.count,
      offset: response.data.offset
    });
  } catch (error) {
    console.error('Error fetching mandi prices:', error.message);
    res.status(502).json({ 
      error: 'PROVIDER_ERROR',
      message: 'Failed to retrieve data from the external market data provider.' 
    });
  }
};

exports.saveSellingEstimate = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const {
      cropId,
      commodity,
      quantityQuintals,
      marketName,
      reportedPricePerQuintal,
      priceDate,
      transportCost,
      otherSellingCosts,
      percentageCharges,
      productionCost,
      netProceeds,
      estimatedProfit
    } = req.body;

    const estimate = await prisma.sellingEstimate.create({
      data: {
        farmerId,
        cropId: cropId || null,
        commodity,
        quantityQuintals,
        marketName,
        reportedPricePerQuintal,
        priceDate,
        transportCost,
        otherSellingCosts,
        percentageCharges,
        productionCost,
        netProceeds,
        estimatedProfit
      }
    });

    res.status(201).json(estimate);
  } catch (error) {
    console.error('Error saving estimate:', error);
    res.status(500).json({ message: 'Failed to save selling estimate.' });
  }
};

exports.getSellingEstimates = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const estimates = await prisma.sellingEstimate.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(estimates);
  } catch (error) {
    console.error('Error fetching estimates:', error);
    res.status(500).json({ message: 'Failed to fetch estimates.' });
  }
};

exports.deleteSellingEstimate = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const estimate = await prisma.sellingEstimate.findUnique({ where: { id: parseInt(id) } });
    if (!estimate || estimate.farmerId !== farmerId) {
      return res.status(404).json({ message: 'Estimate not found.' });
    }

    await prisma.sellingEstimate.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted successfully.' });
  } catch (error) {
    console.error('Error deleting estimate:', error);
    res.status(500).json({ message: 'Failed to delete estimate.' });
  }
};




exports.optimizeProfit = async (req, res) => {
  try {
    const pythonServiceUrl = process.env.PROFIT_OPTIMIZER_URL || 'http://localhost:8001/api/optimize';
    const response = await axios.post(pythonServiceUrl, req.body, { timeout: 15000 });
    res.json(response.data);
  } catch (error) {
    console.error('Error optimizing profit via Python service:', error.message);
    res.status(500).json({ message: 'Failed to optimize profit. Python service may be down.' });
  }
};
