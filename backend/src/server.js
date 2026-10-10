const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Disable strict TLS verification for native fetch to fix AGMARKNET missing intermediate certificates
try {
  const { Agent, setGlobalDispatcher } = require('undici');
  setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
} catch (e) {
  // undici might not be available in very old node versions, but fetch implies it is.
}

// Explicitly resolve the .env path so it works regardless of the terminal's working directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Safe diagnostic log to verify environment variables without exposing values
console.log(`[Config] DATA_GOV_IN_API_KEY is ${process.env.DATA_GOV_IN_API_KEY ? 'LOADED' : 'MISSING'}`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const scanRoutes = require('./routes/scanRoutes');
const mandiRoutes = require('./routes/mandiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/mandi', mandiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
