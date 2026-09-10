const prisma = require('../prisma');

// Helper to detect language from query text if input is multilingual
const detectLanguageFromText = (text, defaultLang = 'en-IN') => {
  const teluguRegex = /[\u0C00-\u0C7F]/;
  const devanagariRegex = /[\u0900-\u097F]/;

  if (teluguRegex.test(text)) return 'te-IN';
  if (devanagariRegex.test(text)) {
    // Distinguish between Marathi and Hindi markers if possible
    if (/कसे|कसं|आहे|आहेत|पिका|पिके|माझे|माझं|सांगा|उघड|तपासा|मक्या|टोमॅटो|झाले|पाहिजे|करायचे/.test(text)) {
      return 'mr-IN';
    }
    return 'hi-IN';
  }

  // Transliteration keyword checks
  const lower = text.toLowerCase();
  // Telugu indicators
  if (/\b(ela|vundi|undi|bavunda|bagundi|cheppu|panta|pantalu|mokkajonna|tamata|kavali|em|enti|chudu|chudandi|naa|na)\b/.test(lower) || lower.includes("ela undi") || lower.includes("ela vundi") || lower.includes("cheppandi")) {
    return 'te-IN';
  }
  // Marathi indicators
  if (/\b(kasa|ahe|aahe|kase|kasaa|chalale|maza|maje|majhe|pik|pike|sheti|sang|sanga|kashi|kashe)\b/.test(lower) || lower.includes("kasa ahe") || lower.includes("kase ahe")) {
    return 'mr-IN';
  }
  // Hindi indicators
  if (/\b(kaisa|kaise|kaisi|fasal|batao|bataiye|khet|meri|mera|mere|hal|haal|kya)\b/.test(lower) || lower.includes("kaisa hai") || lower.includes("kaisi hai")) {
    return 'hi-IN';
  }

  return defaultLang;
};

// Crop entity extraction across scripts and transliterations
const extractCropType = (text) => {
  const lower = text.toLowerCase();

  // Corn / Maize
  if (
    lower.includes("corn") ||
    lower.includes("maize") ||
    lower.includes("మొక్కజొన్న") ||
    lower.includes("mokkajonna") ||
    lower.includes("mokkajona") ||
    lower.includes("मका") ||
    lower.includes("maka") ||
    lower.includes("मक्का") ||
    lower.includes("makka") ||
    lower.includes("bhutta")
  ) {
    return "Corn";
  }

  // Tomato
  if (
    lower.includes("tomato") ||
    lower.includes("టమోటా") ||
    lower.includes("టమాటా") ||
    lower.includes("tamata") ||
    lower.includes("टोमॅटो") ||
    lower.includes("टमाटर") ||
    lower.includes("tamatar")
  ) {
    return "Tomato";
  }

  // Cotton
  if (
    lower.includes("cotton") ||
    lower.includes("పత్తి") ||
    lower.includes("patti") ||
    lower.includes("कापूस") ||
    lower.includes("kapus") ||
    lower.includes("कपास") ||
    lower.includes("kapas")
  ) {
    return "Cotton";
  }

  // Wheat
  if (
    lower.includes("wheat") ||
    lower.includes("గోధుమ") ||
    lower.includes("godhuma") ||
    lower.includes("गहू") ||
    lower.includes("gahu") ||
    lower.includes("गेहूं") ||
    lower.includes("gehun")
  ) {
    return "Wheat";
  }

  return null;
};

// Check if query is an analytics/health question
const isCropStatusQuery = (text) => {
  const lower = text.toLowerCase();
  const statusKeywords = [
    "how is", "how's", "status", "health", "condition", "growth", "analytics", "report", "update", "progress",
    // Telugu
    "ఎలా ఉంది", "ఎలావుంది", "బాగుందా", "పరిస్థితి", "విశ్లేషణ", "ఎలాగ ఉంది", "చెప్పు", "ela undi", "ela vundi", "bavunda", "paristiti", "status cheppu",
    // Marathi
    "कसे आहे", "कसं आहे", "परिस्थिती", "आरोग्य", "अहवाल", "कसा आहे", "kasa ahe", "kasa aahe", "kase ahe", "paristithi", "kasa chalala",
    // Hindi
    "कैसी है", "कैसा है", "हाल", "स्थिति", "स्वास्थ्य", "कैसा चल रहा है", "kaisa hai", "kaisi hai", "kaisa chal raha hai", "haal"
  ];
  return statusKeywords.some(keyword => lower.includes(keyword));
};

// Check if query is explicitly asking to open camera / scan
const isExplicitScanQuery = (text) => {
  const lower = text.toLowerCase();
  const scanKeywords = [
    "scan", "camera", "photo", "picture", "take photo",
    "స్కాన్", "కెమెరా", "ఫోటో", "తనిఖీ",
    "स्कॅन", "कॅमेरा", "फोटो", "तपासा",
    "स्कैन", "कैमरा", "फोटो"
  ];
  return scanKeywords.some(keyword => lower.includes(keyword));
};

const processVoiceIntent = async (req, res) => {
  try {
    const { text, context, language } = req.body;
    const farmerId = req.user?.id || 1;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Text prompt is required" });
    }

    const detectedLang = detectLanguageFromText(text, language || 'en-IN');
    const lang = detectedLang;
    const lowerText = text.toLowerCase();

    console.log(`[VoiceAI] Input: "${text}" | Detected Lang: ${lang} | Context:`, context);

    // Fetch all crops belonging to this farmer with their tasks and scans
    const farmerCrops = await prisma.crop.findMany({
      where: { farmerId },
      include: {
        tasks: true,
        reports: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Also fetch general reports if any
    const allReports = await prisma.report.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' }
    });

    // Localized dictionary for responses & helpers
    const dict = {
      'en-IN': {
        noCrops: "You don't have any crops registered yet. Please add a crop first in your dashboard.",
        cropNotFound: (name) => `I couldn't find ${name} in your registered fields. Your registered crops are ${farmerCrops.map(c => c.type).join(", ")}.`,
        whichCropToAsk: (crops) => `Which crop would you like to check? You have ${crops}.`,
        openDirect: (crop) => `Opening scanner for your ${crop}.`,
        didntCatch: "I didn't catch that. Do you want to check your Tomato or Corn crop?",
        fallback: "I can analyze your crops, check scan status, and diagnose diseases. Try asking 'How is my corn crop?' or 'Scan my crop'.",
        // Analytics generator
        formatAnalytics: ({ cropName, type, ageDays, stage, area, yieldTarget, lastScanDays, lastScanReport, pendingTasksCount, delayed }) => {
          let summary = `Your ${cropName} (${type}) is ${ageDays} days old, across ${area} acres in the ${stage} stage.`;
          
          if (pendingTasksCount > 0) {
            summary += ` You have ${pendingTasksCount} pending field task${pendingTasksCount > 1 ? 's' : ''}.`;
          }

          if (delayed) {
            if (lastScanDays === null) {
              summary += ` Note: You have not scanned this crop yet. Regular scans are required for accurate disease tracking. Please scan your ${type} crop once again so we can analyze it.`;
            } else {
              summary += ` Note: Your last scan was ${lastScanDays} days ago, so the diagnostic scan is delayed. Please scan the crop once again so that we can analyze its health accurately.`;
            }
          } else {
            summary += ` Recent AI diagnosis indicates: ${lastScanReport?.disease || 'Normal growth'} with ${Math.round((lastScanReport?.confidence || 0.9) * 100)}% match. Foliage is in good condition.`;
          }
          return summary;
        }
      },
      'te-IN': {
        noCrops: "మీరు ఇంకా ఏ పంటను నమోదు చేయలేదు. దయచేసి ముందుగా డాష్‌బోర్డ్‌లో పంటను జోడించండి.",
        cropNotFound: (name) => `మీ నమోదిత పొలాల్లో ${name} పంట కనిపించలేదు. మీ వద్ద ఉన్న పంటలు: ${farmerCrops.map(c => c.type).join(", ")}.`,
        whichCropToAsk: (crops) => `మీరు ఏ పంట వివరాలు తెలుసుకోవాలనుకుంటున్నారు? మీ వద్ద ${crops} ఉన్నాయి.`,
        openDirect: (crop) => `మీ ${crop} పంట కోసం కెమెరా స్కానర్ తెరుస్తున్నాను.`,
        didntCatch: "నాకు అర్థం కాలేదు. మీరు టమాటా లేదా మొక్కజొన్న గురించి తెలుసుకోవాలనుకుంటున్నారా?",
        fallback: "నేను మీ పంటల విశ్లేషణ, స్కాన్ వివరాలు మరియు వ్యాధులను తెలియజేయగలను. 'నా మొక్కజొన్న పంట ఎలా ఉంది?' అని అడగండి.",
        formatAnalytics: ({ cropName, type, ageDays, stage, area, yieldTarget, lastScanDays, lastScanReport, pendingTasksCount, delayed }) => {
          const typeTe = type === 'Corn' ? 'మొక్కజొన్న' : type === 'Tomato' ? 'టమోటా' : type === 'Cotton' ? 'పత్తి' : type;
          let summary = `మీ ${typeTe} (${cropName}) పంట వయస్సు ${ageDays} రోజులు, ${area} ఎకరాల విస్తీర్ణంలో ${stage} దశలో ఉంది.`;

          if (pendingTasksCount > 0) {
            summary += ` పూర్తి చేయవలసిన పనులు ${pendingTasksCount} ఉన్నాయి.`;
          }

          if (delayed) {
            if (lastScanDays === null) {
              summary += ` హెచ్చరిక: ఈ పంటను మీరు ఇంతవరకు స్కాన్ చేయలేదు. ఖచ్చితమైన విశ్లేషణ మరియు వ్యాధుల నివారణ కోసం, దయచేసి కెమెరాతో పంటను ఒకసారి స్కాన్ చేయండి.`;
            } else {
              summary += ` హెచ్చరిక: ఈ పంటను స్కాన్ చేసి ${lastScanDays} రోజులు దాటింది, కాబట్టి స్కాన్ ఆలస్యమైంది. తాజా విశ్లేషణ కోసం దయచేసి మీ పంటను మరొకసారి స్కాన్ చేయండి.`;
            }
          } else {
            summary += ` ఇటీవలి AI నిర్ధారణ ప్రకారం: ${lastScanReport?.disease || 'ఆరోగ్యంగా ఉంది'}, ఖచ్చితత్వం ${Math.round((lastScanReport?.confidence || 0.9) * 100)}%. పంట ఎదుగుదల బాగుంది.`;
          }
          return summary;
        }
      },
      'mr-IN': {
        noCrops: "तुम्ही अद्याप कोणतेही पीक नोंदवलेले नाही. कृपया प्रथम डॅशबोर्डवर पीक जोडा.",
        cropNotFound: (name) => `तुमच्या शेतात ${name} पीक आढळले नाही. तुमची नोंदणीकृत पिके: ${farmerCrops.map(c => c.type).join(", ")}.`,
        whichCropToAsk: (crops) => `तुम्हाला कोणत्या पिकाची माहिती हवी आहे? तुमच्याकडे ${crops} पिके आहेत.`,
        openDirect: (crop) => `तुमच्या ${crop} पिकासाठी कॅमेरा स्कॅनर उघडत आहे.`,
        didntCatch: "मला समजले नाही. तुम्हाला टोमॅटो की मका पिकाबद्दल विचारायचे आहे?",
        fallback: "मी तुमच्या पिकांचे विश्लेषण, स्कॅनिंग स्थिती आणि रोग निदान करू शकतो. 'माझे मका पीक कसे आहे?' असे विचारून पहा.",
        formatAnalytics: ({ cropName, type, ageDays, stage, area, yieldTarget, lastScanDays, lastScanReport, pendingTasksCount, delayed }) => {
          const typeMr = type === 'Corn' ? 'मका' : type === 'Tomato' ? 'टोमॅटो' : type === 'Cotton' ? 'कापूस' : type;
          let summary = `तुमचे ${typeMr} (${cropName}) पीक ${ageDays} दिवसांचे असून ${area} एकरांवर ${stage} अवस्थेत आहे.`;

          if (pendingTasksCount > 0) {
            summary += ` तुमची ${pendingTasksCount} कामे प्रलंबित आहेत.`;
          }

          if (delayed) {
            if (lastScanDays === null) {
              summary += ` सूचना: तुम्ही या पिकाचे अद्याप स्कॅनिंग केलेले नाही. अचूक विश्लेषणासाठी आणि रोगांच्या तपासणीसाठी, कृपया पिकाचे कॅमेऱ्याने एकदा स्कॅनिंग करा.`;
            } else {
              summary += ` सूचना: पिकाचे शेवटचे स्कॅनिंग ${lastScanDays} दिवसांपूर्वी झाले होते, त्यामुळे तपासणीस विलंब झाला आहे. आम्ही अचूक विश्लेषण करू शकू यासाठी कृपया पिकाचे पुन्हा एकदा स्कॅनिंग करा.`;
            }
          } else {
            summary += ` अलीकडील AI तपासणीनुसार: ${lastScanReport?.disease || 'पीक सुदृढ आहे'}, अचूकता ${Math.round((lastScanReport?.confidence || 0.9) * 100)}%. पिकाची स्थिती उत्तम आहे.`;
          }
          return summary;
        }
      },
      'hi-IN': {
        noCrops: "आपने अभी तक कोई फसल नहीं जोड़ी है। कृपया पहले डैशबोर्ड में फसल जोड़ें।",
        cropNotFound: (name) => `आपके पंजीकृत खेतों में ${name} फसल नहीं मिली। आपकी फसलें हैं: ${farmerCrops.map(c => c.type).join(", ")}.`,
        whichCropToAsk: (crops) => `आप किस फसल की जानकारी चाहते हैं? आपके पास ${crops} उपलब्ध हैं।`,
        openDirect: (crop) => `आपकी ${crop} फसल के लिए कैमरा स्कैनर खोल रहा हूँ।`,
        didntCatch: "मुझे समझ नहीं आया। क्या आप टमाटर या मक्का के बारे में पूछना चाहते हैं?",
        fallback: "मैं आपकी फसल की स्थिति, विश्लेषण और बीमारियों की जांच में मदद कर सकता हूँ। 'मेरी मक्का की फसल कैसी है?' कहें।",
        formatAnalytics: ({ cropName, type, ageDays, stage, area, yieldTarget, lastScanDays, lastScanReport, pendingTasksCount, delayed }) => {
          const typeHi = type === 'Corn' ? 'मक्का' : type === 'Tomato' ? 'टमाटर' : type === 'Cotton' ? 'कपास' : type;
          let summary = `आपकी ${typeHi} (${cropName}) फसल ${ageDays} दिन की है और ${area} एकड़ में ${stage} चरण में है।`;

          if (pendingTasksCount > 0) {
            summary += ` आपके ${pendingTasksCount} कार्य लंबित हैं।`;
          }

          if (delayed) {
            if (lastScanDays === null) {
              summary += ` ध्यान दें: आपने अभी तक इस फसल का कोई स्कैन नहीं किया है। सटीक विश्लेषण के लिए कृपया अपनी ${typeHi} फसल को एक बार कैमरे से स्कैन करें।`;
            } else {
              summary += ` ध्यान दें: आपका पिछला स्कैन ${lastScanDays} दिन पहले हुआ था, अतः स्कैनिंग में देरी हुई है। सटीक विश्लेषण के लिए कृपया इस फसल को एक बार फिर से स्कैन करें।`;
            }
          } else {
            summary += ` हालिया AI विश्लेषण के अनुसार: ${lastScanReport?.disease || 'फसल स्वस्थ है'}, सटीकता ${Math.round((lastScanReport?.confidence || 0.9) * 100)}% है। बढ़वार अच्छी है।`;
          }
          return summary;
        }
      }
    };

    const t = dict[lang] || dict['en-IN'];

    if (farmerCrops.length === 0) {
      return res.json({ reply: t.noCrops, language: lang });
    }

    const detectedCropType = extractCropType(text);

    // Helper to evaluate a crop's full analytics
    const analyzeCrop = (crop) => {
      const now = new Date();
      const sowing = new Date(crop.sowingDate || crop.createdAt);
      const ageDays = Math.max(1, Math.floor((now - sowing) / (1000 * 60 * 60 * 24)));

      // Find the latest scan report specifically linked to this crop or matching its type
      const cropReport = (crop.reports && crop.reports.length > 0)
        ? crop.reports[0]
        : allReports.find(r => r.cropId === crop.id || (r.disease && r.disease.toLowerCase().includes(crop.type.toLowerCase())));

      let lastScanDays = null;
      let delayed = true; // default delayed if never scanned

      if (cropReport && cropReport.createdAt) {
        lastScanDays = Math.floor((now - new Date(cropReport.createdAt)) / (1000 * 60 * 60 * 24));
        delayed = lastScanDays > 7; // delayed if older than 7 days
      }

      const pendingTasks = (crop.tasks || []).filter(task => !task.completed);

      return {
        cropName: crop.name,
        type: crop.type,
        cropId: crop.id,
        ageDays,
        stage: crop.stage || 'Vegetative Growth',
        area: crop.area,
        yieldTarget: crop.expectedYield,
        lastScanDays,
        lastScanReport: cropReport,
        pendingTasksCount: pendingTasks.length,
        delayed
      };
    };

    // 1. If context is awaiting crop selection from previous turn
    if (context?.awaitingCropSelection) {
      const chosenType = detectedCropType;
      if (chosenType) {
        const matchedCrop = farmerCrops.find(c => c.type.toLowerCase() === chosenType.toLowerCase());
        if (matchedCrop) {
          const stats = analyzeCrop(matchedCrop);
          const reply = t.formatAnalytics(stats);
          return res.json({
            reply,
            action: stats.delayed ? "PROMPT_SCAN" : null,
            cropType: matchedCrop.type,
            cropId: matchedCrop.id,
            delayedScan: stats.delayed,
            language: lang
          });
        }
      }
      return res.json({
        reply: t.didntCatch,
        context: { awaitingCropSelection: true },
        language: lang
      });
    }

    // 2. Query matches explicit CAMERA / SCAN intent
    if (isExplicitScanQuery(text)) {
      if (detectedCropType) {
        const matchedCrop = farmerCrops.find(c => c.type.toLowerCase() === detectedCropType.toLowerCase());
        return res.json({
          reply: t.openDirect(detectedCropType),
          action: "OPEN_CAMERA",
          cropType: detectedCropType,
          cropId: matchedCrop ? matchedCrop.id : null,
          language: lang
        });
      } else if (farmerCrops.length === 1) {
        return res.json({
          reply: t.openDirect(farmerCrops[0].type),
          action: "OPEN_CAMERA",
          cropType: farmerCrops[0].type,
          cropId: farmerCrops[0].id,
          language: lang
        });
      } else {
        const cropNames = farmerCrops.map(c => c.type).join(" or ");
        return res.json({
          reply: t.whichCropToAsk(cropNames),
          context: { awaitingCropSelection: true },
          language: lang
        });
      }
    }

    // 3. Query is about CROP STATUS / HEALTH / ANALYTICS
    if (detectedCropType) {
      const matchedCrop = farmerCrops.find(c => c.type.toLowerCase() === detectedCropType.toLowerCase());
      if (!matchedCrop) {
        return res.json({
          reply: t.cropNotFound(detectedCropType),
          language: lang
        });
      }

      const stats = analyzeCrop(matchedCrop);
      const reply = t.formatAnalytics(stats);

      return res.json({
        reply,
        action: stats.delayed ? "PROMPT_SCAN" : null,
        cropType: matchedCrop.type,
        cropId: matchedCrop.id,
        delayedScan: stats.delayed,
        language: lang
      });
    }

    // 4. Farmer asks generic "how are my crops?" without mentioning a specific crop
    if (isCropStatusQuery(text) || lowerText.includes("crops") || lowerText.includes("पिका") || lowerText.includes("పంటలు") || lowerText.includes("फसल")) {
      if (farmerCrops.length === 1) {
        const stats = analyzeCrop(farmerCrops[0]);
        const reply = t.formatAnalytics(stats);
        return res.json({
          reply,
          action: stats.delayed ? "PROMPT_SCAN" : null,
          cropType: farmerCrops[0].type,
          cropId: farmerCrops[0].id,
          delayedScan: stats.delayed,
          language: lang
        });
      } else {
        // Multi-crop summary
        const analyzed = farmerCrops.map(analyzeCrop);
        const delayedCrops = analyzed.filter(a => a.delayed);

        let multiSummary = "";
        if (lang === 'te-IN') {
          multiSummary = `మీ వద్ద మొత్తం ${farmerCrops.length} పంటలు నమోదై ఉన్నాయి: ${farmerCrops.map(c => c.name).join(", ")}. `;
          if (delayedCrops.length > 0) {
            multiSummary += `${delayedCrops.map(d => d.type === 'Corn' ? 'మొక్కజొన్న' : d.type === 'Tomato' ? 'టమోటా' : d.type).join(", ")} పంటల స్కాన్ ఆలస్యమైంది. దయచేసి ఖచ్చితమైన విశ్లేషణ కోసం వాటిని మళ్లీ స్కాన్ చేయండి.`;
          } else {
            multiSummary += "అన్ని పంటల తాజా స్కాన్‌లు పూర్తి అయ్యాయి. వివరాల కోసం ఏదైనా పంట పేరు చెప్పండి.";
          }
        } else if (lang === 'mr-IN') {
          multiSummary = `तुमच्याकडे एकूण ${farmerCrops.length} पिके नोंदणीकृत आहेत: ${farmerCrops.map(c => c.name).join(", ")}. `;
          if (delayedCrops.length > 0) {
            multiSummary += `${delayedCrops.map(d => d.type === 'Corn' ? 'मका' : d.type === 'Tomato' ? 'टोमॅटो' : d.type).join(", ")} पिकांचे स्कॅनिंग बाकी आहे. अचूक विश्लेषणासाठी कृपया पुन्हा स्कॅनिंग करा.`;
          } else {
            multiSummary += "सर्व पिकांचे स्कॅनिंग अद्ययावत आहे. सविस्तर माहितीसाठी पिकाचे नाव सांगा.";
          }
        } else if (lang === 'hi-IN') {
          multiSummary = `आपके पास कुल ${farmerCrops.length} फसलें दर्ज हैं: ${farmerCrops.map(c => c.name).join(", ")}। `;
          if (delayedCrops.length > 0) {
            multiSummary += `${delayedCrops.map(d => d.type === 'Corn' ? 'मक्का' : d.type === 'Tomato' ? 'टमाटर' : d.type).join(", ")} की स्कैनिंग बाकी है। कृपया सटीक विश्लेषण के लिए दोबारा स्कैन करें।`;
          } else {
            multiSummary += "सभी फसलों का डेटा अद्यतन है। किसी विशेष फसल के बारे में जानने के लिए उसका नाम कहें।";
          }
        } else {
          multiSummary = `You have ${farmerCrops.length} registered crops: ${farmerCrops.map(c => c.name).join(", ")}. `;
          if (delayedCrops.length > 0) {
            multiSummary += `Scans are delayed for ${delayedCrops.map(d => d.type).join(", ")}. Please scan them once again so we can analyze them accurately.`;
          } else {
            multiSummary += "All crop scans are up to date. Ask about any specific crop for detailed analytics.";
          }
        }

        return res.json({
          reply: multiSummary,
          delayedScan: delayedCrops.length > 0,
          language: lang
        });
      }
    }

    // 5. Default Fallback
    res.json({
      reply: t.fallback,
      language: lang
    });

  } catch (error) {
    console.error("[VoiceAI Error]:", error);
    res.status(500).json({ error: "Voice processing failed" });
  }
};

const https = require('https');

// Robust Multi-chunk Streaming Audio TTS for Indian Languages (Telugu, Marathi, Hindi, English)
const fetchTTSChunk = (chunkText, tl) => {
  return new Promise((resolve, reject) => {
    const cleanText = encodeURIComponent(chunkText.trim());
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${cleanText}`;

    https.get(ttsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (ttsRes) => {
      if (ttsRes.statusCode !== 200) {
        return reject(new Error(`TTS API returned status ${ttsRes.statusCode}`));
      }
      const data = [];
      ttsRes.on('data', chunk => data.push(chunk));
      ttsRes.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
};

const splitTextForTTS = (text, maxLen = 140) => {
  // Split on punctuation or line breaks
  const sentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [text];
  const result = [];
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) result.push(current);
      if (s.length > maxLen) {
        const words = s.split(' ');
        let temp = '';
        for (const w of words) {
          if ((temp + ' ' + w).trim().length <= maxLen) {
            temp = (temp + ' ' + w).trim();
          } else {
            if (temp) result.push(temp);
            temp = w;
          }
        }
        if (temp) current = temp;
      } else {
        current = s.trim();
      }
    }
  }
  if (current) result.push(current);
  return result;
};

const synthesizeSpeech = async (req, res) => {
  try {
    const text = req.query.text || '';
    const lang = req.query.lang || 'te-IN';
    
    if (!text) {
      return res.status(400).send("Text is required");
    }

    const tl = lang.split('-')[0].toLowerCase();
    const chunks = splitTextForTTS(text, 140);

    // Fetch all audio chunks in order
    const audioBuffers = [];
    for (const chunk of chunks) {
      try {
        const buffer = await fetchTTSChunk(chunk, tl);
        audioBuffers.push(buffer);
      } catch (err) {
        console.warn(`[TTS] Chunk fetch error for "${chunk}":`, err.message);
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(500).send("No audio generated");
    }

    const fullAudio = Buffer.concat(audioBuffers);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', fullAudio.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.end(fullAudio);

  } catch (error) {
    console.error("[TTS Error]:", error);
    res.status(500).send("TTS error");
  }
};

module.exports = { processVoiceIntent, synthesizeSpeech };
