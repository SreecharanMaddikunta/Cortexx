const express = require('express');
const router = express.Router();
const { processVoiceIntent, synthesizeSpeech } = require('../controllers/voiceController');

router.post('/intent', processVoiceIntent);
router.get('/tts', synthesizeSpeech);

module.exports = router;
