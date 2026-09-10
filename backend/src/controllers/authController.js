const prisma = require('../prisma');
const jwt = require('jsonwebtoken');
// const twilio = require('twilio'); 

const sendOTP = async (req, res) => {
  try {
    let { phone, name } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Normalize phone (strip spaces, hyphens, brackets)
    phone = phone.replace(/[\s()-]/g, '');

    // Prevent new farmers from using an existing phone number
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser && existingUser.name.toLowerCase() !== (name || '').toLowerCase()) {
      return res.status(400).json({ error: "This phone number is already registered to another farmer." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 300000); // 5 minutes expiration
    
    // Store it in the database
    await prisma.otpRecord.upsert({
      where: { phone },
      update: { otp, expiresAt },
      create: { phone, otp, expiresAt }
    });

    // FOR HACKATHON DEMO: Print to backend console so the judges/developers can see it
    console.log(`\n\n=== SMS SENT ===\nTo: ${phone}\nMessage: Your Kisan Mitra verification code is: ${otp}\n================\n\n`);

    res.json({ message: "OTP sent successfully", demoOtp: otp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    let { phone, otp, name } = req.body;
    
    // Normalize phone
    phone = phone.replace(/[\s()-]/g, '');

    const record = await prisma.otpRecord.findUnique({ where: { phone } });
    if (!record) {
      return res.status(400).json({ error: "OTP expired or not requested" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > record.expiresAt) {
      await prisma.otpRecord.delete({ where: { phone } });
      return res.status(400).json({ error: "OTP has expired" });
    }

    // OTP is correct, clear it
    await prisma.otpRecord.delete({ where: { phone } });

    // Find or create farmer
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: name || 'Farmer', phone, password: 'otp-auth', role: 'FARMER' }
      });
    }
    
    // Generate secure isolated JWT session
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'super-secret-key',
      { expiresIn: '365d' } // 1 year persistent session
    );
    
    res.json({ token, role: user.role, name: user.name, phone: user.phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  res.json({ message: "Admin login gateway" });
};

module.exports = { sendOTP, verifyOTP, loginAdmin };
