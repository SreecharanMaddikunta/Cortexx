const prisma = require('../prisma');

const processScan = async (req, res) => {
  try {
    // The user's ID is usually attached by auth middleware.
    // For MVP, we pass it in the body, or we decode JWT.
    const farmerId = req.user?.id || 1; 
    const { imageBase64, cropType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Forward the image to the Python ML microservice using native fetch
    const mlResponse = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: imageBase64,
        cropType: cropType || "Tomato"
      })
    });
    
    if (!mlResponse.ok) {
        throw new Error(`Python API Error: ${mlResponse.status}`);
    }
    const diagnosis = await mlResponse.json();

    // Prevent saving invalid images to the database
    if (diagnosis.isInvalid) {
      return res.json({ 
        success: false, 
        isInvalid: true, 
        message: diagnosis.explanation 
      });
    }

    // Save history persistently to SQLite
    const activeCrop = await prisma.crop.findFirst({
      where: {
        farmerId: farmerId,
        type: { equals: cropType || "Tomato" }
      }
    });

    const report = await prisma.report.create({
      data: {
        farmerId: farmerId,
        cropId: activeCrop ? activeCrop.id : null,
        disease: diagnosis.disease,
        confidence: diagnosis.confidence,
        imageUrl: imageBase64.substring(0, 50) + "...", 
        detailedReport: JSON.stringify(diagnosis)
      }
    });

    // Update the record with full base64 to ensure the history works
    await prisma.report.update({
      where: { id: report.id },
      data: { imageUrl: imageBase64 }
    });

    res.json({ success: true, report: { ...report, imageUrl: imageBase64, detailedReport: diagnosis } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process scan" });
  }
};

const getScanHistory = async (req, res) => {
  try {
    const farmerId = req.user?.id || 1;
    const history = await prisma.report.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' }
    });
    
    const parsedHistory = history.map(h => ({
      ...h,
      detailedReport: h.detailedReport ? JSON.parse(h.detailedReport) : null
    }));
    
    res.json(parsedHistory);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
const deleteScan = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user?.id || 1;
    
    // Verify ownership before deleting
    const scan = await prisma.report.findFirst({
      where: { id: parseInt(id), farmerId }
    });

    if (!scan) {
      return res.status(404).json({ error: "Scan not found or unauthorized" });
    }

    await prisma.report.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: "Scan history deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete scan" });
  }
};

module.exports = { processScan, getScanHistory, deleteScan };
