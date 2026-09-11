import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  'en-IN': {
    // Header & Nav
    portalTitle: "AgriVision AI",
    farmerPortal: "Farmer Portal",
    logout: "Logout",
    greeting: "Namaskaram",
    district: "Pune District, Maharashtra",
    liveAlerts: "Live Alerts",
    newAlerts: "New",
    noAlerts: "No new alerts right now.",
    
    // Crops & Fields
    addCrop: "Add Crop",
    days: "Days",
    acres: "Acres",
    daysOld: "days old",
    sownOn: "Sown on",
    fieldName: "Field / Crop Name",
    fieldNamePlaceholder: "e.g. Tomato Field A",
    cropType: "Crop Type",
    daysAlreadySpent: "Days already spent on crop (mid-cycle start)",
    daysAlreadySpentPlaceholder: "e.g. 35 (leave 0 if just planted)",
    areaAcres: "Area (Acres)",
    expectedYield: "Expected Production / Target Yield",
    expectedYieldPlaceholder: "e.g. 150 Quintals / 15 Tons",
    growthStage: "Current Crop Stage",
    save: "Save Crop",
    close: "Close",
    
    // Crop Stages
    stageGermination: "Germination & Seedling",
    stageVegetative: "Vegetative Growth",
    stageFlowering: "Flowering & Budding",
    stageFruiting: "Fruit Development / Pod Filling",
    stageMaturity: "Ripening & Harvest Ready",
    
    // Crop Names
    Tomato: "Tomato",
    Cotton: "Cotton",
    Corn: "Corn",
    Wheat: "Wheat",
    Soybean: "Soybean",
    Sugarcane: "Sugarcane",

    // Live Weather
    liveWeather: "Live Weather",
    humidity: "Humidity",
    rainToday: "Rain Today",
    tapForTelecast: "Tap for 3-Day Telecast →",
    weatherForecast: "Weather Forecast",
    temperatureTrend: "24-Hour Temperature Trend",
    yesterday: "Yesterday",
    today: "Today",
    tomorrow: "Tomorrow",
    weatherClearCloudy: "Clear / Partly Cloudy",
    weatherRain: "Rain",
    weatherThunderstorm: "Thunderstorm",
    weatherOvercast: "Overcast",

    // Scanner / Diagnostic Card
    aiDiagnostic: "AI DIAGNOSTIC",
    scanCrop: "Scan Crop",
    scanDesc: "Instantly detect diseases and get a professional agronomist report.",
    tapCamera: "Tap to open camera",
    history: "Scan History",

    // Tasks & Task History
    todaysTasks: "Today's Tasks",
    liveAi: "Live AI",
    allCaughtUp: "All caught up!",
    viewAllHistory: "Click to View Details & History →",
    taskHistoryTitle: "Tasks & Activity History",
    todaysTasksTab: "Today's Tasks",
    historyTab: "Previous Completed Tasks",
    markDone: "Mark as Done",
    completedBadge: "Completed",
    pendingBadge: "Pending",
    noTasksToday: "No pending tasks for today! Great job maintaining your field.",
    noCompletedHistory: "No task history recorded yet.",
    completedAt: "Completed on",
    urgentPriority: "Urgent",
    routinePriority: "Routine",
    waterPriority: "Irrigation",

    // Built-in Dynamic Tasks
    task_leaf_curl_followup: "Follow-up: Cotton Leaf Curl Disease (CLCuD)",
    task_leaf_curl_followup_desc: "Verify effectiveness of previous treatment. Rescan if necessary.",
    task_irrigation_mgmt: "Irrigation Management",
    task_irrigation_mgmt_desc: "Soil moisture expected to drop. Prepare drip irrigation lines.",
    task_organic_fertilizer: "Organic Fertilizer Application",
    task_organic_fertilizer_desc: "Apply recommended N-P-K bio-fertilizer for flower retention.",
    task_soil_testing: "Soil Nutrient & Moisture Check",
    task_soil_testing_desc: "Soil pH calibrated at 6.5. Optimum for nutrient absorption.",
    task_fungicide_spray: "Targeted Bio-Fungicide Spray",
    task_fungicide_spray_desc: "Preventive copper-based spray completed across 2 acres.",
    task_initial_survey: "Initial Crop Health Survey",
    task_initial_survey_desc: "Perform baseline photographic scan of newly enrolled field.",

    // Cotton Specialized Tasks
    task_cotton_bollworm: "Pink Bollworm Pheromone Trap Inspection",
    task_cotton_bollworm_desc: "Examine Delta traps across cotton rows. Count adult moth catches to evaluate threshold.",
    task_cotton_squaring: "Square & Flower Bud Retention Spray",
    task_cotton_squaring_desc: "Apply 0.2% Boron and Planofix spray to prevent square drop and boost boll retention.",
    task_cotton_aphid: "Sucking Pest Scouting (Aphids/Jassids)",
    task_cotton_aphid_desc: "Inspect terminal leaves. If nymph count exceeds 5 per leaf, apply neem seed kernel extract (NSKE 5%).",

    // Tomato Specialized Tasks
    task_tomato_blossom_rot: "Calcium Spray (Blossom-End Rot Prevention)",
    task_tomato_blossom_rot_desc: "Apply foliar Calcium Nitrate (0.5%) to developing green fruits to prevent dark rot patches.",
    task_tomato_whitefly: "Whitefly Vector Monitoring",
    task_tomato_whitefly_desc: "Inspect yellow sticky cards along borders to prevent Tomato Leaf Curl Virus transmission.",
    task_tomato_staking: "Trellis Staking & Lateral Shoot Pruning",
    task_tomato_staking_desc: "Prune bottom side-shoots (suckers) and tighten trellis twine to elevate heavy clusters off soil.",

    // Corn & Wheat Specialized Tasks
    task_corn_armyworm: "Fall Armyworm (FAW) Whorl Scouting",
    task_corn_armyworm_desc: "Check central leaf whorls for pinhole feeding damage or frass. Apply biological Nomuraea rileyi if observed.",
    task_corn_nitrogen: "Pre-Tasseling Nitrogen Side-Dress",
    task_corn_nitrogen_desc: "Apply second dose of Nitrogen along root zone before tassel emergence for maximum kernel filling.",
    task_wheat_rust: "Yellow & Brown Rust Pustule Inspection",
    task_wheat_rust_desc: "Examine upper foliage for linear yellow stripes or brown pustules following cool dewy mornings.",
    task_wheat_irrigation: "Crown Root Initiation (CRI) Irrigation",
    task_wheat_irrigation_desc: "Apply light surface irrigation at 20-25 days stage to support robust nodal root anchoring.",

    // Task Filter Tabs
    filterActiveCrop: "Selected Field",
    filterAllCrops: "All Fields",
    tasksFor: "Tasks for",

    // Crop Growth & AI Insights Graph
    cropGrowthAnalytics: "Crop Growth & AI Insights",
    growthComparisonSubtitle: "Actual Growth Curve vs. AI Agronomist Benchmark",
    selectField: "Select Field:",
    overallHealth: "AI Health Score",
    targetYieldProgress: "Expected Yield Target",
    currentDay: "Current Age",
    stageProgress: "Stage Progress",
    actualGrowthLegend: "Farmer Crop Growth",
    aiBenchmarkLegend: "AI Optimal Benchmark",
    aiGrowthInsight: "AI Growth Analysis",
    growthTomatoInsight: "Tomato crop is performing at 94% of optimum curve. Flowering density is healthy. Maintain regular watering every 2 days.",
    growthGeneralInsight: "Crop development is aligning closely with regional climate models. Minimal heat stress detected.",
    harvestForecast: "Estimated Harvest in",
    daysCount: "days"
  },

  'hi-IN': {
    // Header & Nav
    portalTitle: "किसान मित्र",
    farmerPortal: "किसान पोर्टल",
    logout: "लॉग आउट",
    greeting: "नमस्कार",
    district: "पुणे जिला, महाराष्ट्र",
    liveAlerts: "लाइव अलर्ट",
    newAlerts: "नया",
    noAlerts: "अभी कोई नया अलर्ट नहीं है।",

    // Crops & Fields
    addCrop: "फसल जोड़ें",
    days: "दिन",
    acres: "एकड़",
    daysOld: "दिन हुए",
    sownOn: "बुवाई की तारीख",
    fieldName: "खेत / फसल का नाम",
    fieldNamePlaceholder: "उदा. टमाटर का खेत A",
    cropType: "फसल का प्रकार",
    daysAlreadySpent: "फसल के कितने दिन बीत चुके हैं? (मध्य-चक्र शुरुआत)",
    daysAlreadySpentPlaceholder: "उदा. 35 (नया बोया है तो 0 लिखें)",
    areaAcres: "क्षेत्रफल (एकड़)",
    expectedYield: "अपेक्षित उत्पादन / लक्षित उपज",
    expectedYieldPlaceholder: "उदा. 150 क्विंटल / 15 टन",
    growthStage: "वर्तमान फसल चरण",
    save: "फसल सहेजें",
    close: "बंद करें",

    // Crop Stages
    stageGermination: "अंकुरण और पौधा",
    stageVegetative: "वानस्पतिक वृद्धि",
    stageFlowering: "फूल आना और कलियां",
    stageFruiting: "फल विकास / फली भरना",
    stageMaturity: "पकना और कटाई हेतु तैयार",

    // Crop Names
    Tomato: "टमाटर",
    Cotton: "कपास",
    Corn: "मक्का",
    Wheat: "गेहूं",
    Soybean: "सोयाबीन",
    Sugarcane: "गन्ना",

    // Live Weather
    liveWeather: "लाइव मौसम",
    humidity: "नमी",
    rainToday: "आज बारिश",
    tapForTelecast: "3-दिन के मौसम के लिए टैप करें →",
    weatherForecast: "मौसम का पूर्वानुमान",
    temperatureTrend: "24-घंटे तापमान रुझान",
    yesterday: "कल",
    today: "आज",
    tomorrow: "कल",
    weatherClearCloudy: "साफ / आंशिक बादल",
    weatherRain: "बारिश",
    weatherThunderstorm: "गरज के साथ बौछारें",
    weatherOvercast: "बादल छाए रहेंगे",

    // Scanner / Diagnostic Card
    aiDiagnostic: "AI डायग्नोस्टिक",
    scanCrop: "फसल स्कैन करें",
    scanDesc: "तुरंत बीमारियों का पता लगाएं और विशेषज्ञ रिपोर्ट प्राप्त करें।",
    tapCamera: "कैमरा खोलने के लिए टैप करें",
    history: "स्कैन इतिहास",

    // Tasks & Task History
    todaysTasks: "आज के कार्य",
    liveAi: "लाइव AI",
    allCaughtUp: "सब हो गया!",
    viewAllHistory: "विवरण और इतिहास देखने के लिए टैप करें →",
    taskHistoryTitle: "कार्य और गतिविधि इतिहास",
    todaysTasksTab: "आज के कार्य",
    historyTab: "पहले किए गए कार्य",
    markDone: "पूर्ण चिह्नित करें",
    completedBadge: "पूर्ण",
    pendingBadge: "लंबित",
    noTasksToday: "आज के लिए कोई कार्य लंबित नहीं है! बहुत बढ़िया।",
    noCompletedHistory: "अभी तक कोई कार्य इतिहास दर्ज नहीं है।",
    completedAt: "पूरा होने की तारीख",
    urgentPriority: "अत्यावश्यक",
    routinePriority: "नियमित",
    waterPriority: "सिंचाई",

    // Built-in Dynamic Tasks
    task_leaf_curl_followup: "फॉलो-अप: कॉटन लीफ कर्ल बीमारी (CLCuD)",
    task_leaf_curl_followup_desc: "पिछले उपचार की प्रभावशीलता जांचें। जरूरत पड़ने पर पुनः स्कैन करें।",
    task_irrigation_mgmt: "सिंचाई प्रबंधन",
    task_irrigation_mgmt_desc: "मिट्टी की नमी कम होने की संभावना है। ड्रिप सिंचाई लाइन तैयार करें।",
    task_organic_fertilizer: "जैविक खाद का प्रयोग",
    task_organic_fertilizer_desc: "फूलों को गिरने से बचाने के लिए अनुशंसित N-P-K जैव उर्वरक डालें।",
    task_soil_testing: "मृदा पोषण और नमी परीक्षण",
    task_soil_testing_desc: "मृदा pH 6.5 मापा गया। पोषक तत्वों के अवशोषण के लिए आदर्श।",
    task_fungicide_spray: "लक्षित जैव कवकनाशी छिड़काव",
    task_fungicide_spray_desc: "2 एकड़ में तांबा आधारित निवारक छिड़काव सफलतापूर्वक संपन्न।",
    task_initial_survey: "प्रारंभिक फसल स्वास्थ्य सर्वेक्षण",
    task_initial_survey_desc: "हाल ही में पंजीकृत खेत का बुनियादी स्वास्थ्य स्कैन करें।",

    // Cotton Specialized Tasks
    task_cotton_bollworm: "गुलाबी सुंडी फेरोमोन ट्रैप निरीक्षण",
    task_cotton_bollworm_desc: "कपास की कतारों में डेल्टा ट्रैप की जांच करें। वयस्क पतंगों की संख्या गिनें।",
    task_cotton_squaring: "कली और फूल गिरने से रोकने का छिड़काव",
    task_cotton_squaring_desc: "कलियों को गिरने से रोकने और टिंडों को मजबूत करने के लिए 0.2% बोरॉन और प्लानोफिक्स का छिड़काव करें।",
    task_cotton_aphid: "रस चूसक कीटों की जांच (माहू/हरा तेला)",
    task_cotton_aphid_desc: "शीर्ष पत्तियों की जांच करें। कीट अधिक होने पर 5% नीम अर्क (NSKE) का प्रयोग करें।",

    // Tomato Specialized Tasks
    task_tomato_blossom_rot: "कैल्शियम छिड़काव (ब्लॉसम-एंड रॉट रोकथाम)",
    task_tomato_blossom_rot_desc: "टमाटर के फलों को नीचे से सड़ने से बचाने के लिए 0.5% कैल्शियम नाइट्रेट का छिड़काव करें।",
    task_tomato_whitefly: "सफेद मक्खी कीट निगरानी",
    task_tomato_whitefly_desc: "लीफ कर्ल वायरस को फैलने से रोकने के लिए पीले स्टिकी ट्रैप की जांच करें।",
    task_tomato_staking: "मचान सहारा और अनावश्यक शाखाओं की छंटाई",
    task_tomato_staking_desc: "निचली अनचाही शाखाओं (सकर्स) को हटाएं और पौधों को सुतली से बांधकर जमीन से ऊपर रखें।",

    // Corn & Wheat Specialized Tasks
    task_corn_armyworm: "फॉल आर्मीवॉर्म (सैनिक कीट) सर्वेक्षण",
    task_corn_armyworm_desc: "मक्का के केंद्रीय पत्तों के घेरे में सुंडी या छेद की जांच करें।",
    task_corn_nitrogen: "मंजरी निकलने से पूर्व नाइट्रोजन अनुप्रयोग",
    task_corn_nitrogen_desc: "दानों के समुचित विकास हेतु जड़ क्षेत्र में यूरिया की दूसरी खुराक दें।",
    task_wheat_rust: "पीला व भूरा रतुआ (रस्ट) निरीक्षण",
    task_wheat_rust_desc: "पत्तियों पर पीली धारियों या भूरे धब्बों के लक्षणों की जांच करें।",
    task_wheat_irrigation: "मुकुट जड़ अवस्था (CRI) सिंचाई",
    task_wheat_irrigation_desc: "20-25 दिन की अवस्था पर जड़ों के सुदृढ़ीकरण हेतु हल्की सिंचाई करें।",

    // Task Filter Tabs
    filterActiveCrop: "चुना हुआ खेत",
    filterAllCrops: "सभी खेत",
    tasksFor: "कार्य:",

    // Crop Growth & AI Insights Graph
    cropGrowthAnalytics: "फसल विकास और AI अंतर्दृष्टि",
    growthComparisonSubtitle: "वास्तविक फसल वृद्धि बनाम AI आदर्श मानक",
    selectField: "खेत चुनें:",
    overallHealth: "AI स्वास्थ्य स्कोर",
    targetYieldProgress: "लक्षित उपज प्रगति",
    currentDay: "वर्तमान आयु",
    stageProgress: "चरण प्रगति",
    actualGrowthLegend: "किसान की वास्तविक फसल वृद्धि",
    aiBenchmarkLegend: "AI आदर्श मानक",
    aiGrowthInsight: "AI विकास विश्लेषण",
    growthTomatoInsight: "टमाटर की फसल इष्टतम विकास दर के 94% पर बढ़ रही है। फूलों की सघनता उत्कृष्ट है। हर 2 दिन में नियमित सिंचाई जारी रखें।",
    growthGeneralInsight: "फसल का विकास क्षेत्रीय मौसम के अनुकूल बहुत अच्छा चल रहा है।",
    harvestForecast: "अनुमानित कटाई में शेष",
    daysCount: "दिन"
  },

  'mr-IN': {
    // Header & Nav
    portalTitle: "किसान मित्र",
    farmerPortal: "शेतकरी पोर्टल",
    logout: "लॉग आउट",
    greeting: "नमस्कार",
    district: "पुणे जिल्हा, महाराष्ट्र",
    liveAlerts: "थेट सूचना",
    newAlerts: "नवीन",
    noAlerts: "सध्या कोणतीही नवीन सूचना नाही.",

    // Crops & Fields
    addCrop: "पीक जोडा",
    days: "दिवस",
    acres: "एकर",
    daysOld: "दिवस झाले",
    sownOn: "पेरणी दिनांक",
    fieldName: "शेत / पिकाचे नाव",
    fieldNamePlaceholder: "उदा. टोमॅटो शेत A",
    cropType: "पिकाचा प्रकार",
    daysAlreadySpent: "पिकाला किती दिवस झाले आहेत? (मध्य-हंगाम नोंदणी)",
    daysAlreadySpentPlaceholder: "उदा. 35 (नुकतीच पेरणी केली असल्यास 0 लिहा)",
    areaAcres: "क्षेत्रफळ (एकर)",
    expectedYield: "अपेक्षित उत्पादन / उद्दिष्ट उत्पन्न",
    expectedYieldPlaceholder: "उदा. 150 क्विंटल / 15 टन",
    growthStage: "सध्याची पीक वाढीची अवस्था",
    save: "पीक जतन करा",
    close: "बंद करा",

    // Crop Stages
    stageGermination: "अंकुरण आणि रोपे",
    stageVegetative: "शाकीय वाढ",
    stageFlowering: "फुलोरा आणि कळ्या",
    stageFruiting: "फळधारणा / दाणे भरणे",
    stageMaturity: "पक्वता आणि काढणीसाठी तयार",

    // Crop Names
    Tomato: "टोमॅटो",
    Cotton: "कापूस",
    Corn: "मका",
    Wheat: "गहू",
    Soybean: "सोयाबीन",
    Sugarcane: "ऊस",

    // Live Weather
    liveWeather: "थेट हवामान",
    humidity: "आर्द्रता",
    rainToday: "आजचा पाऊस",
    tapForTelecast: "३-दिवसांच्या अंदाजासाठी टॅप करा →",
    weatherForecast: "हवामानाचा अंदाज",
    temperatureTrend: "२४-तास तापमान कल",
    yesterday: "काल",
    today: "आज",
    tomorrow: "उद्या",
    weatherClearCloudy: "निरभ्र / अंशतः ढगाळ",
    weatherRain: "पाऊस",
    weatherThunderstorm: "वादळी पाऊस",
    weatherOvercast: "ढगाळ वातावरण",

    // Scanner / Diagnostic Card
    aiDiagnostic: "AI निदान",
    scanCrop: "पीक स्कॅन करा",
    scanDesc: "त्वरित रोगांचा शोध घ्या आणि तज्ञ अहवाल मिळवा.",
    tapCamera: "कॅमेरा उघडण्यासाठी टॅप करा",
    history: "स्कॅन इतिहास",

    // Tasks & Task History
    todaysTasks: "आजची कामे",
    liveAi: "थेट AI",
    allCaughtUp: "सर्व कामे पूर्ण!",
    viewAllHistory: "तपशील आणि इतिहास पाहण्यासाठी टॅप करा →",
    taskHistoryTitle: "कामे आणि कृती इतिहास",
    todaysTasksTab: "आजची कामे",
    historyTab: "मागील पूर्ण झालेली कामे",
    markDone: "पूर्ण झाले म्हणून नोंदवा",
    completedBadge: "पूर्ण",
    pendingBadge: "प्रलंबित",
    noTasksToday: "आजसाठी कोणतीही कामे प्रलंबित नाहीत! उत्तम व्यवस्थापन.",
    noCompletedHistory: "अद्याप कोणतीही पूर्ण कामे नोंदवलेली नाहीत.",
    completedAt: "पूर्ण झाल्याची तारीख",
    urgentPriority: "तातडीचे",
    routinePriority: "नियमित",
    waterPriority: "सिंचन",

    // Built-in Dynamic Tasks
    task_leaf_curl_followup: "फॉलो-अप: कापूस पर्णगुच्छ रोग (CLCuD)",
    task_leaf_curl_followup_desc: "मागील उपचारांचा परिणाम तपासा. आवश्यक असल्यास पुन्हा स्कॅन करा.",
    task_irrigation_mgmt: "सिंचन व्यवस्थापन",
    task_irrigation_mgmt_desc: "जमिनीतील ओलावा कमी होण्याची शक्यता आहे. ठिबक सिंचन तयार ठेवा.",
    task_organic_fertilizer: "सेंद्रिय खत व्यवस्थापन",
    task_organic_fertilizer_desc: "फुलगळ रोखण्यासाठी शिफारस केलेले N-P-K जैविक खत द्या.",
    task_soil_testing: "माती पोषण आणि ओलावा चाचणी",
    task_soil_testing_desc: "मातीचा pH 6.5 मोजला गेला. अन्नद्रव्ये शोषण्यासाठी अत्यंत योग्य.",
    task_fungicide_spray: "जैविक बुरशीनाशक फवारणी",
    task_fungicide_spray_desc: "2 एकरांमध्ये तांबे-आधारित प्रतिबंधात्मक फवारणी यशस्वीरित्या पूर्ण.",
    task_initial_survey: "पिकांचे प्राथमिक आरोग्य सर्वेक्षण",
    task_initial_survey_desc: "नुकत्याच नोंदवलेल्या शेताचे प्राथमिक आरोग्य स्कॅनिंग करा.",

    // Cotton Specialized Tasks
    task_cotton_bollworm: "गुलाबी बोंडअळी फेरोमोन ट्रॅप तपासणी",
    task_cotton_bollworm_desc: "कापूस ओळींमध्ये डेल्टा ट्रॅप तपासा. पतंगांची संख्या मोजा.",
    task_cotton_squaring: "पाती आणि फुले गळ रोखण्याची फवारणी",
    task_cotton_squaring_desc: "पाती गळ रोखण्यासाठी ०.२% बोरॉन आणि प्लॅनोफिक्सची फवारणी करा.",
    task_cotton_aphid: "रसशोषक किडींचे सर्वेक्षण (मावा/तुडतुडे)",
    task_cotton_aphid_desc: "शेंड्यावरील पाने तपासा. ५% निंबोळी अर्क (NSKE) फवारा.",

    // Tomato Specialized Tasks
    task_tomato_blossom_rot: "कॅल्शियम फवारणी (ब्लॉसम-एंड रॉट प्रतिबंध)",
    task_tomato_blossom_rot_desc: "फळे तळाशी कुजण्यापासून वाचवण्यासाठी ०.५% कॅल्शियम नायट्रेट फवारा.",
    task_tomato_whitefly: "पांढरी माशी कीड देखरेख",
    task_tomato_whitefly_desc: "पर्णगुच्छ विषाणू रोखण्यासाठी पिवळे चिकट सापळे तपासा.",
    task_tomato_staking: "टोमॅटो झाडांना आधार व छाटणी",
    task_tomato_staking_desc: "खालच्या अनावश्यक फांद्या काढा आणि झाडांना दोरीने आधार देऊन फळे जमिनीपासून वर ठेवा.",

    // Corn & Wheat Specialized Tasks
    task_corn_armyworm: "लष्करी अळी (Fall Armyworm) तपासणी",
    task_corn_armyworm_desc: "मक्याच्या पोंग्यातील अळ्यांची तपासणी करा.",
    task_corn_nitrogen: "तुरा येण्यापूर्वी नत्र खत देणे",
    task_corn_nitrogen_desc: "कणीस भरण्यासाठी युरियाचा दुसरा हप्ता द्या.",
    task_wheat_rust: "पिवळा व तांबेरा रोग निरीक्षण",
    task_wheat_rust_desc: "पानांवरील पिवळ्या पट्ट्यांची तपासणी करा.",
    task_wheat_irrigation: "मुकुट मुळे फुटण्याची अवस्था (CRI) सिंचन",
    task_wheat_irrigation_desc: "२०-२५ दिवसांच्या अवस्थेत मुळे मजबूत होण्यासाठी हलके पाणी द्या.",

    // Task Filter Tabs
    filterActiveCrop: "निवडलेले शेत",
    filterAllCrops: "सर्व शेते",
    tasksFor: "कामे:",

    // Crop Growth & AI Insights Graph
    cropGrowthAnalytics: "पीक वाढ आणि AI अंतर्दृष्टी",
    growthComparisonSubtitle: "प्रत्यक्ष पीक वाढ वि. AI आदर्श प्रमाण",
    selectField: "शेत निवडा:",
    overallHealth: "AI आरोग्य गुण",
    targetYieldProgress: "अपेक्षित उत्पादन प्रगती",
    currentDay: "सध्याचे वय",
    stageProgress: "टप्पा प्रगती",
    actualGrowthLegend: "शेतकऱ्याची प्रत्यक्ष पीक वाढ",
    aiBenchmarkLegend: "AI आदर्श मानक",
    aiGrowthInsight: "AI वाढ विश्लेषण",
    growthTomatoInsight: "टोमॅटोचे पीक आदर्श वाढीच्या 94% गतीने वाढत आहे. फुलोरा अतिशय उत्तम आहे. दर 2 दिवसांनी नियमित पाणी द्या.",
    growthGeneralInsight: "पिकाची वाढ प्रादेशिक हवामानानुसार उत्तम प्रकारे होत आहे.",
    harvestForecast: "अंदाजे काढणीस उरले",
    daysCount: "दिवस"
  },

  'te-IN': {
    // Header & Nav
    portalTitle: "కిసాన్ మిత్ర",
    farmerPortal: "రైతు పోర్టల్",
    logout: "లాగ్ అవుట్",
    greeting: "నమస్కారం",
    district: "పూణే జిల్లా, మహారాష్ట్ర",
    liveAlerts: "లైవ్ అలెర్ట్స్",
    newAlerts: "కొత్త",
    noAlerts: "ప్రస్తుతం కొత్త అలెర్ట్స్ లేవు.",

    // Crops & Fields
    addCrop: "పంటను జోడించండి",
    days: "రోజులు",
    acres: "ఎకరాలు",
    daysOld: "రోజులు అయ్యాయి",
    sownOn: "విత్తిన తేదీ",
    fieldName: "పొలం / పంట పేరు",
    fieldNamePlaceholder: "ఉదా. టమోటా పొలం A",
    cropType: "పంట రకం",
    daysAlreadySpent: "పంట వేసి ఎన్ని రోజులైంది? (మధ్యలో ప్రారంభించినట్లయితే)",
    daysAlreadySpentPlaceholder: "ఉదా. 35 (ఇప్పుడే నాటితే 0 అని ఇవ్వండి)",
    areaAcres: "విస్తీర్ణం (ఎకరాలు)",
    expectedYield: "ఆశించిన దిగుబడి / లక్ష్య ఉత్పత్తి",
    expectedYieldPlaceholder: "ఉదా. 150 క్వింటాళ్లు / 15 టన్నులు",
    growthStage: "ప్రస్తుత పంట దశ",
    save: "పంటను సేవ్ చేయండి",
    close: "మూసివేయి",

    // Crop Stages
    stageGermination: "మొలక మరియు నారు దశ",
    stageVegetative: "శాకీయ పెరుగుదల",
    stageFlowering: "పూత మరియు మొగ్గ దశ",
    stageFruiting: "కాయ అభివృద్ధి / గింజ నిండే దశ",
    stageMaturity: "కోతకు సిద్ధంగా ఉంది",

    // Crop Names
    Tomato: "టమోటా",
    Cotton: "పత్తి",
    Corn: "మొక్కజొన్న",
    Wheat: "గోధుమ",
    Soybean: "సోయాబీన్",
    Sugarcane: "చెరకు",

    // Live Weather
    liveWeather: "లైవ్ వాతావరణం",
    humidity: "తేమ",
    rainToday: "నేడు వర్షం",
    tapForTelecast: "3 రోజుల వాతావరణం కోసం నొక్కండి →",
    weatherForecast: "వాతావరణ సూచన",
    temperatureTrend: "24-గంటల ఉష్ణోగ్రత ట్రెండ్",
    yesterday: "నిన్న",
    today: "నేడు",
    tomorrow: "రేపు",
    weatherClearCloudy: "స్పష్టమైన / పాక్షిక మేఘావృతం",
    weatherRain: "వర్షం",
    weatherThunderstorm: "ఉరుములతో కూడిన వర్షం",
    weatherOvercast: "పూర్తిగా మేఘావృతం",

    // Scanner / Diagnostic Card
    aiDiagnostic: "AI విశ్లేషణ",
    scanCrop: "పంటను స్కాన్ చేయండి",
    scanDesc: "వ్యాధులను తక్షణమే గుర్తించి నిపుణుల నివేదికను పొందండి.",
    tapCamera: "కెమెరాను తెరవడానికి నొక్కండి",
    history: "స్కాన్ చరిత్ర",

    // Tasks & Task History
    todaysTasks: "నేటి పనులు",
    liveAi: "లైవ్ AI",
    allCaughtUp: "అన్నీ పూర్తయ్యాయి!",
    viewAllHistory: "వివరాలు మరియు చరిత్ర చూడటానికి నొక్కండి →",
    taskHistoryTitle: "పనులు & మునుపటి కార్యకలాపాల చరిత్ర",
    todaysTasksTab: "నేటి పనులు",
    historyTab: "పూర్తయిన మునుపటి పనులు",
    markDone: "పూర్తయినట్లు గుర్తించండి",
    completedBadge: "పూర్తయింది",
    pendingBadge: "బాకీ ఉంది",
    noTasksToday: "నేటికి ఎలాంటి బాకీ పనులు లేవు! అద్భుతం.",
    noCompletedHistory: "ఇంకా మునుపటి పనుల చరిత్ర లేదు.",
    completedAt: "పూర్తయిన తేదీ",
    urgentPriority: "అత్యవసరం",
    routinePriority: "సాధారణం",
    waterPriority: "నీటిపారుదల",

    // Built-in Dynamic Tasks
    task_leaf_curl_followup: "ఫాలో-అప్: పత్తి ఆకు ముడుత తెగులు (CLCuD)",
    task_leaf_curl_followup_desc: "మునుపటి నివారణ చర్య ప్రభావశీలతను తనిఖీ చేయండి. అవసరమైతే మళ్లీ స్కాన్ చేయండి.",
    task_irrigation_mgmt: "నీటిపారుదల నిర్వహణ",
    task_irrigation_mgmt_desc: "నేలలో తేమ శాతం తగ్గే అవకాశం ఉంది. డ్రిప్ లైన్లను సిద్ధం చేసుకోండి.",
    task_organic_fertilizer: "సేంద్రీయ ఎరువుల వినియోగం",
    task_organic_fertilizer_desc: "పూత రాలకుండా ఉండేందుకు సూచించిన N-P-K బయో ఎరువును వేయండి.",
    task_soil_testing: "నేల పోషకాలు మరియు తేమ పరీక్ష",
    task_soil_testing_desc: "నేల pH 6.5 వద్ద స్థిరంగా ఉంది. పోషకాల గ్రహణానికి అత్యుత్తమం.",
    task_fungicide_spray: "జీవ శిలీంద్ర సంహారిణి పిచికారీ",
    task_fungicide_spray_desc: "2 ఎకరాలలో రాగి ఆధారిత నివారణ పిచికారీ విజయవంతంగా పూర్తయింది.",
    task_initial_survey: "ప్రాథమిక పంట ఆరోగ్య సర్వే",
    task_initial_survey_desc: "కొత్తగా నమోదు చేసుకున్న పొలానికి సంబంధించి ప్రాథమిక ఫోటో స్కాన్ చేయండి.",

    // Cotton Specialized Tasks
    task_cotton_bollworm: "గులాబీ రంగు కాయ తొలిచే పురుగు ఫెరోమోన్ ట్రాప్ తనిఖీ",
    task_cotton_bollworm_desc: "పత్తి వరుసలలో డెల్టా ట్రాప్‌లను పరిశీలించండి. రెక్కల పురుగుల సంఖ్యను లెక్కించండి.",
    task_cotton_squaring: "పూత మరియు మొగ్గ రాలకుండా నివారణ పిచికారీ",
    task_cotton_squaring_desc: "మొగ్గ రాలడాన్ని నివారించడానికి 0.2% బోరాన్ మరియు ప్లానోఫిక్స్ పిచికారీ చేయండి.",
    task_cotton_aphid: "రసం పీల్చే పురుగుల పరిశీలన (పేనుబంక/తామర పురుగులు)",
    task_cotton_aphid_desc: "చిగురుటాకుల కింద భాగం తనిఖీ చేయండి. 5% వేప గింజల కషాయం (NSKE) పిచికారీ చేయండి.",

    // Tomato Specialized Tasks
    task_tomato_blossom_rot: "కాల్షియం పిచికారీ (కాయ కుళ్లు తెగులు నివారణ)",
    task_tomato_blossom_rot_desc: "టమోటా కాయలు అడుగున నల్లగా కుళ్ళిపోకుండా 0.5% కాల్షియం నైట్రేట్ పిచికారీ చేయండి.",
    task_tomato_whitefly: "తెల్లదోమ నిఘా మరియు పసుపు జిగురు అట్టలు",
    task_tomato_whitefly_desc: "టమోటా ఆకుముడుత వైరస్ వ్యాప్తిని నివారించడానికి పసుపు జిగురు అట్టలను పరిశీలించండి.",
    task_tomato_staking: "మొక్కలకు కర్రల ఊతం & అనవసర రెమ్మల కత్తిరింపు",
    task_tomato_staking_desc: "క్రింది భాగంలోని పిలకలను కత్తిరించి, కాయల గుత్తులు నేలకు తగలకుండా తాడుతో కర్రలకు కట్టండి.",

    // Corn & Wheat Specialized Tasks
    task_corn_armyworm: "కత్తెర పురుగు (Fall Armyworm) గమనింపు",
    task_corn_armyworm_desc: "మొక్కజొన్న సుడులలో పురుగులు లేదా రంధ్రాలు ఉన్నాయో తనిఖీ చేయండి.",
    task_corn_nitrogen: "కంకి దశకు ముందు నత్రజని ఎరువు వేయడం",
    task_corn_nitrogen_desc: "గింజలు బాగా ఊరడానికి మొదళ్ల వద్ద యూరియా రెండవ విడత వేయండి.",
    task_wheat_rust: "పసుపు మరియు గోధుమ రంగు కుంకుమ తెగులు తనిఖీ",
    task_wheat_rust_desc: "ఆకులపై పసుపు చారలు లేదా కుంకుమ మచ్చలను గమనించండి.",
    task_wheat_irrigation: "కిరీటం వేర్ల దశ (CRI) నీటిపారుదల",
    task_wheat_irrigation_desc: "విత్తిన 20-25 రోజులకు వేర్లు బలంగా నాటుకోవడానికి తేలికపాటి తడి ఇవ్వండి.",

    // Task Filter Tabs
    filterActiveCrop: "ఎంచుకున్న పొలం",
    filterAllCrops: "అన్ని పొలాలు",
    tasksFor: "పనులు:",

    // Crop Growth & AI Insights Graph
    cropGrowthAnalytics: "పంట పెరుగుదల & AI విశ్లేషణ",
    growthComparisonSubtitle: "రైతు వాస్తవ పెరుగుదల vs. AI సూచిక ప్రమాణం",
    selectField: "పొలాన్ని ఎంచుకోండి:",
    overallHealth: "AI ఆరోగ్య స్కోరు",
    targetYieldProgress: "లక్ష్య దిగుబడి పురోగతి",
    currentDay: "ప్రస్తుత వయస్సు",
    stageProgress: "దశ పురోగతి",
    actualGrowthLegend: "రైతు వాస్తవ పెరుగుదల",
    aiBenchmarkLegend: "AI ఆదర్శ ప్రమాణం",
    aiGrowthInsight: "AI పెరుగుదల విశ్లేషణ",
    growthTomatoInsight: "టమోటా పంట 94% ఆదర్శ వేగంతో ఎదుగుతోంది. పూత మరియు కాయల సాంద్రత బాగుంది. ప్రతి 2 రోజులకు క్రమం తప్పకుండా నీరు అందించండి.",
    growthGeneralInsight: "ప్రాంతీయ వాతావరణానికి అనుగుణంగా పంట పెరుగుదల చాలా బాగుంది. ఎలాంటి ఉష్ణ ఒత్తిడి లేదు.",
    harvestForecast: "అంచనా వేసిన కోత సమయం",
    daysCount: "రోజులు"
  }
};

export const LanguageProvider = ({ children }) => {
  // Read from localStorage or default to English
  const [language, setLanguage] = useState(localStorage.getItem('farmer_lang') || 'en-IN');

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('farmer_lang', langCode);
  };

  const t = (key) => {
    if (!key) return '';
    return translations[language]?.[key] || translations['en-IN']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
