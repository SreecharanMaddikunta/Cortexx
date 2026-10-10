const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const DATA_GOV_IN_RESOURCE_ID = process.env.DATA_GOV_IN_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';

// Simple memory cache
const cache = new Map();

exports.getConfig = (req, res) => {
  res.json({
    apiKey: process.env.DATA_GOV_IN_API_KEY,
    resourceId: DATA_GOV_IN_RESOURCE_ID
  });
};

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

    const cacheKey = `${commodity}-${state}-${district}-${market}-${limit}-${offset}`;

    if (demo === 'true') {
      return res.json({
        records: [
          {
            commodity: commodity || 'Tomato',
            state: state || 'Punjab',
            district: district || 'Amritsar',
            market: 'Amritsar',
            minPrice: 1700,
            maxPrice: 2500,
            modalPrice: 2200,
            unit: '₹/quintal',
            source: 'Mock Data (Demo Mode)',
            retrievedAt: new Date().toISOString()
          },
          {
            commodity: commodity || 'Tomato',
            state: state || 'Punjab',
            district: district || 'Ludhiana',
            market: 'Ludhiana',
            minPrice: 1800,
            maxPrice: 2600,
            modalPrice: 2350,
            unit: '₹/quintal',
            source: 'Mock Data (Demo Mode)',
            retrievedAt: new Date().toISOString()
          },
          {
            commodity: commodity || 'Onion',
            state: state || 'Maharashtra',
            district: district || 'Pune',
            market: 'Pune',
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
        limit,
        offset
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

    let responseData;
    let fetchSuccess = false;

    // Strategy 1: Native Node Fetch (might be blocked by OS firewall)
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        responseData = await response.json();
        fetchSuccess = true;
      }
    } catch (err) {
      console.log("[Mandi API] Node fetch blocked by firewall, attempting curl fallback...");
    }

    // Strategy 2: curl.exe fallback (Bypasses node.exe firewall rules)
    if (!fetchSuccess) {
      try {
        const { stdout } = await execPromise(`curl.exe -s "${url}"`, { timeout: 7000 });
        responseData = JSON.parse(stdout);
        fetchSuccess = true;
        console.log("[Mandi API] Curl fallback successful!");
      } catch (err) {
        console.log("[Mandi API] Curl fallback failed, attempting PowerShell fallback...");
      }
    }

    // Strategy 3: PowerShell fallback (Ultimate system-level bypass)
    if (!fetchSuccess) {
      try {
        const psCommand = `powershell -NoProfile -Command "(Invoke-WebRequest -Uri '${url}' -UseBasicParsing).Content"`;
        const { stdout } = await execPromise(psCommand, { timeout: 10000 });
        responseData = JSON.parse(stdout);
        fetchSuccess = true;
        console.log("[Mandi API] PowerShell fallback successful!");
      } catch (err) {
        console.error("[Mandi API] All network strategies failed.");
      }
    }

    if (!fetchSuccess || !responseData) {
      if (cache.has(cacheKey)) {
        const cachedEntry = cache.get(cacheKey);
        return res.status(200).json({ ...cachedEntry.data, message: 'Showing cached data due to network blocking.' });
      }
      return res.status(503).json({ error: 'NETWORK_BLOCKED', message: 'Connection blocked by local firewall. Please click "Enable Demo Mode" to simulate data.' });
    }

    if (!responseData.records || !Array.isArray(responseData.records)) {
      return res.status(502).json({
        error: 'INVALID_RESPONSE',
        message: 'The government API returned an invalid format.'
      });
    }

    const transformedRecords = responseData.records.map(record => ({
      commodity: record.commodity || 'Unknown',
      state: record.state || 'Unknown',
      district: record.district || 'Unknown',
      market: record.market || 'Unknown',
      arrivalDate: record.arrival_date || new Date().toLocaleDateString('en-GB'),
      minPrice: parseFloat(record.min_price) || 0,
      maxPrice: parseFloat(record.max_price) || 0,
      modalPrice: parseFloat(record.modal_price) || 0,
      unit: '₹/quintal',
      source: 'data.gov.in (AGMARKNET)',
      retrievedAt: new Date().toISOString()
    }));

    const finalData = {
      records: transformedRecords,
      total: responseData.total || transformedRecords.length,
      count: responseData.count || transformedRecords.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: finalData });

    res.json(finalData);
  } catch (error) {
    console.error('Mandi API Error:', error.message);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred while fetching market data.'
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
