const prisma = require('../prisma');
const { GoogleGenAI } = require('@google/genai');
const https = require('https');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Fast Intent & Entity Extraction
const detectIntent = (text) => {
  const lower = text.toLowerCase();
  if (/camera|scan|స్కాన్|క్యామెరా|స్కానర్|photo|picture|स्काॅन|कैमरा/.test(lower)) return "OPEN_CAMERA";
  if (/all crops|అన్ని|అన్నింటి|పంటలన్నీ|सारी फसलें|सर्व पिके|सगळी पिके/.test(lower)) return "ALL_CROPS_STATUS";
  if (/how old|age|days|ఎన్ని రోజులు|వయసు|कितने दिन|वय/.test(lower)) return "CROP_AGE";
  if (/disease|problem|issue|వ్యాధి|సమస్య|పురుగు|రోగం|बीमारी|समस्या|रोग/.test(lower)) return "DISEASE_QUERY";
  if (/water|నీరు|నీళ్లు|पानी|सिंचाई|paani/.test(lower)) return "WATERING_QUERY";
  if (/how is|status|condition|ఎలా ఉంది|ఉన్నాయి|పరిస్థితి|బాగుందా|कैसा है|कैसी है|हाल|कसे आहे|स्थिती/.test(lower)) return "CROP_STATUS";
  return "UNKNOWN";
};

const extractCropType = (text) => {
  const lower = text.toLowerCase();
  if (/corn|maize|మొక్కజొన్న|మక్క|मक्का|मकई|मका/.test(lower)) return "Corn";
  if (/tomato|టమాటా|టమోటా|टमाटर|टोमॅटो/.test(lower)) return "Tomato";
  if (/cotton|పత్తి|కపాస్|कपास|कापूस/.test(lower)) return "Cotton";
  if (/wheat|గోధుమ|గేహూ|गेहूं|गहू/.test(lower)) return "Wheat";
  if (/all|అన్ని|सारी|सर्व/.test(lower)) return "ALL";
  return null;
};

const getLocalizedText = (lang, template, vars) => {
  const l = lang.substring(0, 2);
  const strings = {
    'en': {
      'age': `Your ${vars.crop} is ${vars.age} days old and currently in the ${vars.stage} stage.`,
      'healthy': `Your ${vars.crop} is doing well. No major issues detected.`,
      'attention': `Your ${vars.crop} needs attention. The latest scan detected ${vars.disease}.`,
      'all_healthy': `All your crops are doing well.`,
      'all_mixed': `Your ${vars.good} crops are healthy, but your ${vars.bad} crops need attention.`,
      'scan': `Opening the camera for ${vars.crop}.`
    },
    'te': {
      'age': `మీ ${vars.crop} పంటకు ${vars.age} రోజులు పూర్తయ్యాయి. ఇది ప్రస్తుతం ${vars.stage} దశలో ఉంది.`,
      'healthy': `మీ ${vars.crop} పంట బాగానే ఉంది. ఎలాంటి సమస్యలు లేవు.`,
      'attention': `మీ ${vars.crop} పంటకు శ్రద్ధ అవసరం. తాజా స్కాన్లో ${vars.disease} లక్షణాలు కనిపించాయి.`,
      'all_healthy': `మీ పంటలన్నీ బాగానే ఉన్నాయి.`,
      'all_mixed': `మీ ${vars.good} పంటలు ఆరోగ్యంగా ఉన్నాయి, కానీ ${vars.bad} పంటలకు శ్రద్ధ అవసరం.`,
      'scan': `${vars.crop} కోసం కెమెరాను తెరుస్తున్నాను.`
    },
    'hi': {
      'age': `आपकी ${vars.crop} की फसल ${vars.age} दिन की हो गई है।`,
      'healthy': `आपकी ${vars.crop} की फसल अच्छी स्थिति में है।`,
      'attention': `आपकी ${vars.crop} की फसल पर ध्यान देने की जरूरत है। हालिया स्कैन में ${vars.disease} मिला है।`,
      'all_healthy': `आपकी सभी फसलें अच्छी हैं।`,
      'all_mixed': `आपकी ${vars.good} फसलें स्वस्थ हैं, लेकिन ${vars.bad} पर ध्यान देने की जरूरत है।`,
      'scan': `${vars.crop} के लिए कैमरा खोल रहा हूँ।`
    },
    'mr': {
      'age': `तुमचे ${vars.crop} पीक ${vars.age} दिवसांचे झाले आहे.`,
      'healthy': `तुमचे ${vars.crop} पीक चांगल्या स्थितीत आहे.`,
      'attention': `तुमच्या ${vars.crop} पिकाकडे लक्ष देणे आवश्यक आहे.`,
      'all_healthy': `तुमची सर्व पिके निरोगी आहेत.`,
      'all_mixed': `तुमची ${vars.good} पिके निरोगी आहेत, पण ${vars.bad} पिकांवर लक्ष देणे गरजेचे आहे.`,
      'scan': `${vars.crop} साठी कॅमेरा उघडत आहे.`
    }
  };
  return (strings[l] && strings[l][template]) ? strings[l][template] : strings['en'][template];
};

const resolveContext = (detectedCrop, intent, context) => {
  let resolvedCrop = detectedCrop;
  if (!resolvedCrop && context && context.lastCrop) resolvedCrop = context.lastCrop;
  return { resolvedCrop };
};

const processVoiceIntent = async (req, res) => {
  try {
    const { text, context, language, clientCropData } = req.body;
    const farmerId = req.user?.id || 1;
    const lang = language || 'en-IN';

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Text prompt is required" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const intent = detectIntent(text);
    const detectedCrop = extractCropType(text);
    const { resolvedCrop } = resolveContext(detectedCrop, intent, context);
    
    // FAST PATH vs SMART PATH
    if (intent !== "UNKNOWN") {
      // It's a simple query. Fast path.
      res.write(`data: ${JSON.stringify({ type: 'status', message: 'Retrieving data...' })}\n\n`);
      
      const crops = await prisma.crop.findMany({
        where: { farmerId },
        include: { reports: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' }
      });
      
      let matchedCrops = crops;
      if (resolvedCrop && resolvedCrop !== "ALL") {
         matchedCrops = crops.filter(c => c.type.toLowerCase() === resolvedCrop.toLowerCase());
      }
      
      if (matchedCrops.length === 0) {
         res.write(`data: ${JSON.stringify({ type: 'text_chunk', text: 'I could not find that crop in your records.' })}\n\n`);
         res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
         return res.end();
      }
      
      const crop = matchedCrops[0];
      const now = new Date();
      const age = Math.max(1, Math.floor((now - new Date(crop.sowingDate)) / (1000 * 60 * 60 * 24)));
      const lastScan = crop.reports[0];
      const hasDisease = lastScan && !lastScan.disease.includes('Healthy') && lastScan.confidence > 0.6;
      
      let replyText = "";
      let uiData = null;
      let action = null;
      
      if (intent === "OPEN_CAMERA") {
         replyText = getLocalizedText(lang, 'scan', { crop: crop.type });
         action = "PROMPT_SCAN";
      } else if (intent === "CROP_AGE") {
         replyText = getLocalizedText(lang, 'age', { crop: crop.type, age, stage: crop.stage || 'Vegetative' });
         uiData = { title: crop.type, overall_status: "GOOD", details: ["Age: " + age + " days", "Stage: " + (crop.stage || 'Vegetative')] };
      } else if (intent === "ALL_CROPS_STATUS" || resolvedCrop === "ALL") {
         const good = matchedCrops.filter(c => !c.reports[0] || c.reports[0].disease.includes('Healthy')).map(c => c.type);
         const bad = matchedCrops.filter(c => c.reports[0] && !c.reports[0].disease.includes('Healthy')).map(c => c.type);
         if (bad.length === 0) replyText = getLocalizedText(lang, 'all_healthy', {});
         else replyText = getLocalizedText(lang, 'all_mixed', { good: good.join(', ') || 'other', bad: bad.join(', ') });
         uiData = { title: "All Crops", overall_status: bad.length > 0 ? "NEEDS_ATTENTION" : "HEALTHY", details: [] };
      } else {
         if (hasDisease) {
            replyText = getLocalizedText(lang, 'attention', { crop: crop.type, disease: lastScan.disease });
            uiData = { title: crop.type, overall_status: "NEEDS_ATTENTION", details: ["Disease: " + lastScan.disease] };
            action = "PROMPT_SCAN";
         } else {
            replyText = getLocalizedText(lang, 'healthy', { crop: crop.type });
            uiData = { title: crop.type, overall_status: "HEALTHY", details: ["No issues detected"] };
         }
      }
      
      res.write(`data: ${JSON.stringify({ type: 'text_chunk', text: replyText })}\n\n`);
      if (uiData) res.write(`data: ${JSON.stringify({ type: 'ui_data', uiData })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done', action, context: { lastCrop: resolvedCrop, intent } })}\n\n`);
      return res.end();
    }

    // SMART PATH (LLM)
    res.write(`data: ${JSON.stringify({ type: 'status', message: 'Thinking...' })}\n\n`);
    
    const [crops] = await Promise.all([
      prisma.crop.findMany({
        where: { farmerId },
        include: { tasks: { where: { completed: false } }, reports: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const now = new Date();
    const cropData = crops.map(crop => {
      const sowingDate = new Date(crop.sowingDate);
      const ageDays = Math.max(1, Math.floor((now - sowingDate) / (1000 * 60 * 60 * 24)));
      const lastScan = crop.reports.length > 0 ? crop.reports[0] : null;
      return {
        name: crop.name,
        type: crop.type,
        ageDays,
        stage: crop.stage || "Vegetative",
        pendingTasks: crop.tasks.map(t => t.titleKey),
        latestScan: lastScan ? { disease: lastScan.disease, confidence: lastScan.confidence } : null,
      };
    });

    const systemPrompt = `You are Cortex, an intelligent, professional, and friendly multilingual agricultural AI Advisor.
Your objective is to answer the farmer's voice query based on their actual real-time crop database.
### RULES
1. NEVER fabricate data. Use ONLY the CROP DATA provided.
2. DO NOT just read database fields. Explain health naturally.
3. ALWAYS respond in the exact language the farmer is speaking.
4. Output EXACTLY two parts: First the spoken response. Then "---UI_DATA_START---" on a new line. Then a strict JSON object with visual dashboard data.
Example:
Your tomato crop is 40 days old.
---UI_DATA_START---
{"title": "Tomato", "overall_status": "HEALTHY", "details": ["Age: 40 days"]}
### CROP DATA
${JSON.stringify(cropData, null, 2)}
### CONTEXT
${JSON.stringify(context || {})}
`;

    const stream = await ai.models.generateContentStream({
        model: 'gemini-3.5-flash-lite',
        contents: text,
        config: { systemInstruction: systemPrompt, temperature: 0.2 }
    });

    let buffer = '';
    let isJsonMode = false;
    let jsonBuffer = '';

    for await (const chunk of stream) {
        if (!chunk.text) continue;
        
        if (isJsonMode) {
            jsonBuffer += chunk.text;
        } else {
            buffer += chunk.text;
            const splitIdx = buffer.indexOf('---UI_DATA_START---');
            
            if (splitIdx !== -1) {
                const remainingText = buffer.substring(0, splitIdx);
                if (remainingText.trim()) {
                    res.write(`data: ${JSON.stringify({ type: 'text_chunk', text: remainingText.trim() })}\n\n`);
                }
                isJsonMode = true;
                jsonBuffer += buffer.substring(splitIdx + 19);
            } else {
                let match;
                while ((match = buffer.match(/(.*?[.?!।\n])\s*(.*)/))) {
                    const sentence = match[1].trim();
                    buffer = match[2] || '';
                    if (sentence) {
                        res.write(`data: ${JSON.stringify({ type: 'text_chunk', text: sentence })}\n\n`);
                    }
                }
            }
        }
    }

    if (!isJsonMode && buffer.trim()) {
        res.write(`data: ${JSON.stringify({ type: 'text_chunk', text: buffer.trim() })}\n\n`);
    }

    if (jsonBuffer.trim()) {
        try {
            const uiData = JSON.parse(jsonBuffer.trim());
            res.write(`data: ${JSON.stringify({ type: 'ui_data', uiData })}\n\n`);
        } catch (e) {}
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error("[VoiceAI Error]:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Voice processing failed", details: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }
};

const synthesizeSpeech = async (req, res) => {
  try {
    const text = req.query.text || '';
    const lang = req.query.lang || 'te-IN';
    if (!text) return res.status(400).send("Text is required");

    const tl = lang.split('-')[0].toLowerCase();
    const cleanText = encodeURIComponent(text.trim());
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${cleanText}`;
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    https.get(ttsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (ttsRes) => {
      if (ttsRes.statusCode !== 200) {
         return res.status(ttsRes.statusCode).end();
      }
      ttsRes.pipe(res);
    }).on('error', (err) => {
       res.status(500).send("TTS request error");
    });
  } catch (error) {
    res.status(500).send("TTS error");
  }
};

module.exports = { processVoiceIntent, synthesizeSpeech };
