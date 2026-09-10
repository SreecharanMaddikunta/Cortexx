const prisma = require('../prisma');

// Fetch Farmer Profile
const getFarmerProfile = async (req, res) => {
  try {
    const farmerId = req.user?.id || 1;
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId }
    });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ==========================================
// CROP MANAGEMENT (CRUD)
// ==========================================

const getCrops = async (req, res) => {
  try {
    const farmerId = req.user?.id || 1;
    const crops = await prisma.crop.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch crops" });
  }
};

// Helper: Crop-specific task template generator
const getCropSpecificTemplates = (cropType, stage = 'Vegetative') => {
  const type = (cropType || '').toLowerCase();

  if (type === 'cotton') {
    return [
      {
        titleKey: "task_cotton_bollworm",
        descKey: "task_cotton_bollworm_desc",
        type: "urgent",
        icon: "bug"
      },
      {
        titleKey: "task_cotton_squaring",
        descKey: "task_cotton_squaring_desc",
        type: "routine",
        icon: "fertilizer"
      },
      {
        titleKey: "task_cotton_aphid",
        descKey: "task_cotton_aphid_desc",
        type: "water",
        icon: "droplet"
      }
    ];
  } else if (type === 'tomato') {
    return [
      {
        titleKey: "task_tomato_blossom_rot",
        descKey: "task_tomato_blossom_rot_desc",
        type: "routine",
        icon: "fertilizer"
      },
      {
        titleKey: "task_tomato_whitefly",
        descKey: "task_tomato_whitefly_desc",
        type: "urgent",
        icon: "bug"
      },
      {
        titleKey: "task_tomato_staking",
        descKey: "task_tomato_staking_desc",
        type: "water",
        icon: "droplet"
      }
    ];
  } else if (type === 'corn' || type === 'maize') {
    return [
      {
        titleKey: "task_corn_armyworm",
        descKey: "task_corn_armyworm_desc",
        type: "urgent",
        icon: "bug"
      },
      {
        titleKey: "task_corn_nitrogen",
        descKey: "task_corn_nitrogen_desc",
        type: "routine",
        icon: "fertilizer"
      }
    ];
  } else {
    // Wheat / general
    return [
      {
        titleKey: "task_wheat_rust",
        descKey: "task_wheat_rust_desc",
        type: "urgent",
        icon: "bug"
      },
      {
        titleKey: "task_wheat_irrigation",
        descKey: "task_wheat_irrigation_desc",
        type: "water",
        icon: "droplet"
      }
    ];
  }
};

const addCrop = async (req, res) => {
  try {
    const farmerId = req.user?.id || 1;
    const { name, type, sowingDate, daysSpent, area, expectedYield, stage } = req.body;
    
    // Calculate sowing date based on daysSpent if provided
    let calculatedSowingDate = new Date();
    if (daysSpent && !isNaN(parseInt(daysSpent))) {
      calculatedSowingDate = new Date(Date.now() - parseInt(daysSpent) * 24 * 60 * 60 * 1000);
    } else if (sowingDate) {
      calculatedSowingDate = new Date(sowingDate);
    }

    const newCrop = await prisma.crop.create({
      data: {
        farmerId,
        name,
        type,
        sowingDate: calculatedSowingDate,
        area: parseFloat(area) || 1.0,
        expectedYield: expectedYield ? parseFloat(expectedYield) : null,
        stage: stage || 'Vegetative'
      }
    });

    // Create authentic crop-specific tasks for this new crop
    const templates = getCropSpecificTemplates(type, stage);
    for (const tpl of templates) {
      await prisma.task.create({
        data: {
          farmerId,
          cropId: newCrop.id,
          titleKey: tpl.titleKey,
          descKey: tpl.descKey,
          type: tpl.type,
          icon: tpl.icon,
          completed: false
        }
      });
    }

    res.json(newCrop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add crop" });
  }
};

const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete associated tasks first
    await prisma.task.deleteMany({
      where: { cropId: parseInt(id) }
    });

    await prisma.crop.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: "Crop harvested/deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete crop" });
  }
};

// ==========================================
// DYNAMIC TASKS & ALERTS (WITH DETAILED HISTORY & CROP FILTER)
// ==========================================

const getTasks = async (req, res) => {
  try {
    const farmerId = req.user?.id || 1;
    const { cropId } = req.query;

    // Fetch existing crops for the farmer
    const farmerCrops = await prisma.crop.findMany({
      where: { farmerId }
    });

    // Ensure each crop has specialized tasks
    for (const crop of farmerCrops) {
      const activeTasksCount = await prisma.task.count({
        where: { cropId: crop.id, completed: false }
      });

      if (activeTasksCount === 0) {
        const templates = getCropSpecificTemplates(crop.type, crop.stage);
        for (const tpl of templates) {
          await prisma.task.create({
            data: {
              farmerId,
              cropId: crop.id,
              titleKey: tpl.titleKey,
              descKey: tpl.descKey,
              type: tpl.type,
              icon: tpl.icon,
              completed: false
            }
          });
        }
      }
    }

    const whereClause = { farmerId };
    if (cropId && !isNaN(parseInt(cropId))) {
      whereClause.cropId = parseInt(cropId);
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: { crop: true },
      orderBy: { createdAt: 'desc' }
    });

    const todayTasks = tasks.filter(t => !t.completed);
    const historyTasks = tasks.filter(t => t.completed).sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

    res.json({
      tasks: todayTasks,
      history: historyTasks
    });
  } catch (error) {
    console.error("Failed to fetch tasks", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });
    res.json({ success: true, task: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

const formatTimeAgo = (date) => {
  const diffSec = Math.floor((new Date() - new Date(date)) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
};

const getAlerts = async (req, res) => {
  try {
    const dbAlerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // If no broadcast alerts created yet, return baseline demo alerts
    if (dbAlerts.length === 0) {
      const defaultAlerts = [
        { 
          id: 1001, 
          title: "Heavy Rain Warning", 
          message: "Expected 20mm rainfall tomorrow. Delay fertilizer application.", 
          type: "warning", 
          severity: "MEDIUM",
          region: "Pune District",
          time: "10 mins ago",
          createdAt: new Date()
        },
        { 
          id: 1002, 
          title: "Market Price Update", 
          message: "Tomato prices surged by 15% in Pune APMC.", 
          type: "success", 
          severity: "LOW",
          region: "Maharashtra APMC",
          time: "1 hour ago",
          createdAt: new Date()
        }
      ];
      return res.json(defaultAlerts);
    }

    const formatted = dbAlerts.map(a => ({
      id: a.id,
      title: a.title,
      message: a.message,
      region: a.region,
      severity: a.severity,
      type: a.severity === 'HIGH' ? 'danger' : a.severity === 'MEDIUM' ? 'warning' : 'info',
      time: formatTimeAgo(a.createdAt),
      createdAt: a.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

module.exports = { 
  getFarmerProfile, 
  getCrops, 
  addCrop, 
  deleteCrop, 
  getTasks,
  completeTask,
  getAlerts
};
