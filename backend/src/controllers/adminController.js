const prisma = require('../prisma');

// Real-time GIS & disease map reports
const getMapData = async (req, res) => {
  try {
    const { crop: filterCrop } = req.query;

    const whereClause = filterCrop ? {
      crop: {
        OR: [
          { name: filterCrop },
          { type: filterCrop }
        ]
      }
    } : {};

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        farmer: { select: { name: true, phone: true } },
        crop: { select: { name: true, type: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Known centroids for common regions if location is not set
    const districtCoords = {
      'pune': [18.5204, 73.8567],
      'nashik': [19.9975, 73.7898],
      'nagpur': [21.1458, 79.0882],
      'mumbai': [19.0760, 72.8777],
      'aurangabad': [19.8762, 75.3433],
      'satara': [17.6805, 74.0183],
      'kolhapur': [16.7050, 74.2433]
    };

    const formatted = reports.map((r, index) => {
      let lat = 18.5204 + (Math.sin(index) * 0.08);
      let lng = 73.8567 + (Math.cos(index) * 0.08);

      if (r.location && r.location.includes(',')) {
        const parts = r.location.split(',');
        lat = parseFloat(parts[0]) || lat;
        lng = parseFloat(parts[1]) || lng;
      }

      return {
        id: r.id,
        lat,
        lng,
        disease: r.disease,
        confidence: Math.round((r.confidence || 0.85) * 100) + '%',
        farmerName: r.farmer?.name || 'Farmer',
        farmerPhone: r.farmer?.phone || 'N/A',
        cropName: r.crop?.name || r.crop?.type || 'Crop',
        severity: r.disease.toLowerCase().includes('healthy') ? 'Low' : 'High',
        createdAt: r.createdAt
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// All crop scans database
const getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        farmer: { select: { name: true, phone: true } },
        crop: { select: { name: true, type: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = reports.map(r => ({
      id: r.id,
      farmer: r.farmer?.name || 'Farmer',
      phone: r.farmer?.phone || 'N/A',
      crop: r.crop?.name || r.crop?.type || 'Crop',
      disease: r.disease,
      conf: Math.round((r.confidence || 0.85) * 100) + '%',
      date: new Date(r.createdAt).toISOString().split('T')[0],
      createdAt: r.createdAt,
      loc: 'Pune District'
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Live farmers directory
const getFarmers = async (req, res) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      include: {
        crops: {
          include: {
            tasks: true,
            reports: { orderBy: { createdAt: 'desc' }, take: 1 }
          }
        },
        reports: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = farmers.map(f => {
      const totalAcres = f.crops.reduce((sum, c) => sum + (c.area || 0), 0);
      const latestScan = f.reports.length > 0 ? f.reports[0] : null;

      return {
        id: f.id,
        name: f.name,
        phone: f.phone,
        joinedDate: f.createdAt,
        totalAcres,
        cropsCount: f.crops.length,
        reportsCount: f.reports.length,
        crops: f.crops.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          area: c.area,
          stage: c.stage,
          ageDays: Math.max(1, Math.floor((new Date() - new Date(c.sowingDate || c.createdAt)) / 86400000))
        })),
        latestDisease: latestScan ? latestScan.disease : 'No scans yet',
        lastScanDate: latestScan ? latestScan.createdAt : null
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin alert management
const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAlert = async (req, res) => {
  try {
    const { title, message, region, severity } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const alert = await prisma.alert.create({
      data: {
        title,
        message,
        region: region || "All Districts",
        severity: (severity || "HIGH").toUpperCase()
      }
    });

    console.log(`[Admin Alert Broadcasted] "${title}" | Severity: ${alert.severity} | Region: ${alert.region}`);
    res.status(201).json({ success: true, message: 'Alert broadcasted to all farmers successfully', alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.alert.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: "Alert removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAnalyticsStats = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { crop: true }
    });

    const totalScans = reports.length;
    let highRiskCount = 0;
    let healthyCount = 0;

    const diseaseMap = {};
    const cropMap = {};

    reports.forEach(r => {
      // Risk stats
      const diseaseName = r.disease || 'Unknown';
      const isHealthy = diseaseName.toLowerCase().includes('healthy');
      if (isHealthy) {
        healthyCount++;
      } else {
        highRiskCount++;
      }

      // Disease breakdown
      if (!isHealthy) {
        diseaseMap[diseaseName] = (diseaseMap[diseaseName] || 0) + 1;
      }

      // Crop breakdown
      const cropName = r.crop?.type || r.crop?.name || 'Unknown';
      cropMap[cropName] = (cropMap[cropName] || 0) + 1;
    });

    const diseaseBreakdown = Object.keys(diseaseMap)
      .map(key => ({ name: key, value: diseaseMap[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    const cropBreakdown = Object.keys(cropMap)
      .map(key => ({ name: key, value: cropMap[key] }))
      .sort((a, b) => b.value - a.value);

    res.json({
      totalScans,
      highRiskCount,
      healthyCount,
      diseaseBreakdown,
      cropBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportAnalyticsCSV = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        farmer: { select: { name: true, phone: true } },
        crop: { select: { name: true, type: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let csv = 'ID,Date,Farmer Name,Phone,Crop,Disease,Confidence,Severity\n';
    
    reports.forEach(r => {
      const isHealthy = (r.disease || '').toLowerCase().includes('healthy');
      const severity = isHealthy ? 'Low' : 'High';
      const cropName = r.crop?.name || r.crop?.type || 'Unknown';
      const date = new Date(r.createdAt).toISOString().split('T')[0];
      const confidence = Math.round((r.confidence || 0.85) * 100) + '%';
      
      csv += `${r.id},${date},"${r.farmer?.name || 'N/A'}","${r.farmer?.phone || 'N/A'}","${cropName}","${r.disease}",${confidence},${severity}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('disease_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getMapData, 
  getReports, 
  getFarmers, 
  getAlerts, 
  createAlert, 
  deleteAlert,
  getAnalyticsStats,
  exportAnalyticsCSV
};
