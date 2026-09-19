/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Advisor Quality Evaluation Engine & Test Benchmark Dataset.
 * 
 * Evaluation Categories:
 * 1. Pricing (التسعير وهامش الربح بالدينار)
 * 2. Low message-to-order conversion (ضعف تحويل رسائل الواتساب/الخاص)
 * 3. High returns (معالجة وتقليل نسبة الراجع)
 * 4. Advertising performance (أداء الإعلانات وحساب CPA/ROAS)
 * 5. Product-page quality (جودة صفحات الهبوط ونسبة الإكمال)
 * 6. WhatsApp scripts (سكريبتات المحادثة والإغلاق بالعامية العراقية)
 * 7. Ambiguous questions that should trigger clarification (الأسئلة الغامضة وطلب التوضيح)
 * 8. Two unrelated questions asked sequentially (اختبار عزل السياق ومنع التداخل)
 * 
 * Evaluation Rubrics:
 * - Topic relevance
 * - No context contamination
 * - Presence of a concrete next action
 * - Correct use of calculations
 * - Appropriate uncertainty
 * - Iraqi Arabic output
 */

export interface AdvisorTestCase {
  id: string;
  category:
    | "pricing"
    | "low_conversion"
    | "high_returns"
    | "ad_performance"
    | "product_page"
    | "whatsapp_scripts"
    | "ambiguous_question"
    | "unrelated_sequential_questions";
  titleAr: string;
  descriptionAr: string;
  userPrompt: string;
  previousTurnContext?: { role: "user" | "assistant"; text: string }[];
  expectedKeywords: string[];
  forbiddenContaminationKeywords?: string[];
  requiresCalculation: boolean;
  requiresClarificationQuestion: boolean;
  requiresConcreteAction: boolean;
  sampleGoldAnswer?: string;
}

export interface EvaluationCriterionResult {
  passed: boolean;
  score: number; // 0 to 100
  feedbackAr: string;
  details?: string;
}

export interface TestCaseEvaluationReport {
  testCaseId: string;
  category: string;
  titleAr: string;
  passedAll: boolean;
  overallScore: number;
  criteria: {
    topicRelevance: EvaluationCriterionResult;
    noContextContamination: EvaluationCriterionResult;
    concreteNextAction: EvaluationCriterionResult;
    correctCalculations: EvaluationCriterionResult;
    appropriateUncertainty: EvaluationCriterionResult;
    iraqiArabicOutput: EvaluationCriterionResult;
  };
}

export interface EvaluationSuiteSummary {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageScore: number;
  categoryScores: Record<string, number>;
  reports: TestCaseEvaluationReport[];
}

export type AdvisorEvaluationSuiteResult = EvaluationSuiteSummary;

/**
 * 8 Standard Benchmark Test Cases
 */
export const ADVISOR_EVALUATION_DATASET: AdvisorTestCase[] = [
  // 1. Pricing
  {
    id: "eval_pricing_01",
    category: "pricing",
    titleAr: "التسعير الذكي وهامش أمان الراجع",
    descriptionAr: "حساب سعر البيع المناسب لمنتج كلفته 12,000 د.ع وتوصيله 5,000 د.ع لضمان الربح وتغطية الإعلانات.",
    userPrompt: "عندي منتج كلفته 12,000 دينار والتوصيل 5,000 دينار، شلون أسعره حتى أربح وما أخسر بالراجع والإعلانات؟",
    expectedKeywords: ["دينار", "كلفة", "تسعير", "راجع", "هامش", "إعلان", "صافي"],
    requiresCalculation: true,
    requiresClarificationQuestion: false,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "أهلاً بيك يا غالي. حسبتك واضحة وبسيطة علمود تضمن ربح صافي:\n1. الكلفة المباشرة (المنتج 12,000 + توصيل 5,000) = 17,000 دينار.\n2. لازم تحسب كلفة الاستحواذ الإعلاني (CPA) بحدود 4,000 إلى 6,000 دينار.\n3. نسبة أمان للراجع (Return Buffer) بحدود 2,000 إلى 3,000 دينار.\nالسعر المقترح للبيع: بين 28,000 إلى 32,000 دينار عراقي مع تقديم بكج أو هدية بسيطة.",
  },

  // 2. Low message-to-order conversion
  {
    id: "eval_low_conversion_02",
    category: "low_conversion",
    titleAr: "علاج ضعف تحويل رسائل الواتساب",
    descriptionAr: "معالجة مشكلة استقبال 50 رسالة يومياً مع إغلاق 2 أو 3 طلبات فقط.",
    userPrompt: "تجيني 50 رسالة باليوم ع الواتساب بس أسد طلبين أو 3 بس، وين الخلل وشلون أعالج التحويل؟",
    expectedKeywords: ["تحويل", "رسالة", "رد", "زبون", "طلب", "معدل"],
    requiresCalculation: true,
    requiresClarificationQuestion: false,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "هلا بيك عيوني. نسبة التحويل الحالية عندك هي 4% إلى 6% (طلبين من 50 رسالة)، بينما المعدل الطبيعي بالسوق العراقي لازم يكون 15% إلى 25%.\nأهم 3 خطوات فورية لمعالجة الخلل:\n1. طبق قاعدة الـ 2 دقيقة للرد السريع لأن الزبون العراقي يسأل 3 صفحات بنفس الوقت.\n2. استخدم بصمة صوت (Voice Note) دافية ومحترمة تشرح الضمان وطريقة الاستلام.\n3. لا تجاوب على السعر برقم مجرد، اعرض الباكيج كامل ويا التوصيل والضمان.",
  },

  // 3. High returns
  {
    id: "eval_high_returns_03",
    category: "high_returns",
    titleAr: "السيطرة على المرتجع بالمحافظات",
    descriptionAr: "خطة عملية لخفض نسبة المرتجع التي بلغت 35% في المحافظات.",
    userPrompt: "نسبة الراجع بالمحافظات وصلت عندي 35% وخسرت أرباحي كلها، شنو خطوات تقليل الراجع؟",
    expectedKeywords: ["راجع", "محافظات", "تثبيت", "مندوب", "تأكيد", "توصيل", "هاتف"],
    requiresCalculation: true,
    requiresClarificationQuestion: false,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "أهلاً بيك يا طيب. نسبة 35% راجع تحرق أي ربح للتجارة الإلكترونية. الحل العملي بخطوات واضحة:\n1. مكالمة التثبيت الصباحية قبل خروج المندوب: التأكيد على العنوان ونقطة دالة واضحة وجاهزية المبلغ نقدياً.\n2. إرسال رسالة واتساب برقم تتبع المندوب مع كود الطلب.\n3. ربط شركة التوصيل بشرط محاولتين للتسليم قبل الإرجاع لمستودعك.",
  },

  // 4. Advertising performance
  {
    id: "eval_ad_performance_04",
    category: "ad_performance",
    titleAr: "تقييم الحملات وكلفة الطلب CPA",
    descriptionAr: "تشخيص حملة إعلانية على تيك توك وفيسبوك تحقق CPA بقيمة 10 دولار مع طلبات منخفضة.",
    userPrompt: "حملتي على تيك توك وفيسبوك الـ CPA بيها 10 دولار والأوردرات قليلة، أوقفها لو أعدل؟",
    expectedKeywords: ["cpa", "إعلان", "دولار", "فيديو", "عرض", "حملة", "طلب"],
    requiresCalculation: false,
    requiresClarificationQuestion: false,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "شوف حبيبي، كلفة 10 دولار (حوالي 15,000 د.ع) لكل طلب (CPA) تعتبر مرتفعة إذا كان سعر منتجك تحت 40,000 د.ع.\nلا توقف الحملة كلها فوراً بل طبق هذا التعديل:\n1. غير أول 3 ثواني بالفيديو الإعلاني (Hook) وركز على المشكلة المباشرة بالعامية.\n2. اختبر عرض العبوة المزدوجة (Bundle) لرفع قيمة السلة وتغطية كلفة الإعلانات.\n3. تأكد إن الاستهداف مفتوح (Broad) بدون تضييق مبالغ فيه بالمحافظات.",
  },

  // 5. Product-page quality
  {
    id: "eval_product_page_05",
    category: "product_page",
    titleAr: "تحسين صفحة المنتج ونموذج الطلب",
    descriptionAr: "معالجة خروج الزوار من صفحة الهبوط بدون إكمال نموذج الطلب.",
    userPrompt: "الزبائن يدخلون لصفحة الهبوط بس يطلعون بدون ما يملون الفورم، شلون أحسن صفحة المنتج؟",
    expectedKeywords: ["صفحة", "فورم", "هبوط", "طلب", "استلام", "منتج"],
    requiresCalculation: false,
    requiresClarificationQuestion: false,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "عاشت إيدك على الملاحظة. الزبون العراقي يتردد عند ملء فورم صفحة الهبوط لأسباب واضحة:\n1. بسّط الفورم لطلب حقلين فقط: (الاسم ورقم الهاتف + المحافظة ونقطة دالة) بدون بريد أو كود بريدي.\n2. ضع شارة واضحة بخط عريض: (الدفع عند الاستلام بعد الفحص والمعاينة للمنتج).\n3. أضف فيديوهات أو صور حقيقية للمنتج وتجارب زبائن عراقيين سابقة.",
  },

  // 6. WhatsApp scripts
  {
    id: "eval_whatsapp_scripts_06",
    category: "whatsapp_scripts",
    titleAr: "سكريبت عراقي لتجاوز اعتراض السعر",
    descriptionAr: "سكريبت مقنع بالعامية العراقية للرد على زبون يعترض بأن السعر أغلى من باقي الصفحات.",
    userPrompt: "أريد سكريبت جاهز بالعامية العراقية للرد على زبون يگول: السعر غالي شفته بغير صفحة أرخص",
    expectedKeywords: ["سكريبت", "عيوني", "ضمان", "سعر", "فحص", "تدلل"],
    requiresCalculation: false,
    requiresClarificationQuestion: false,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "تدلل يا غالي، هذا السكريبت العراقي المباشر والمجرب لتجاوز اعتراض السعر:\n💬 **السكريبت الجاهز للنسخ:**\n«هلا بيك عيوني.. حقك تقارن طبعاً وكل الهلا بيك. بس حبيت أوضحلك نقطة مهمة: منتجنا هو النسخة الأصلية 100% ويجي وياه ضمان استبدال حقيقي لمدة 6 أشهر، وتكدر تفحص القطعة وتجربها بيد المندوب قبل ما تدفع أي دينار. إذا ما عجبتك الجودة تكدر ترجعها وما تدفع فلس واحد. تحب نثبتلك الحجز ويا بكج الهدايا اليوم؟»",
  },

  // 7. Ambiguous questions that should trigger clarification
  {
    id: "eval_ambiguous_question_07",
    category: "ambiguous_question",
    titleAr: "الأسئلة الغامضة وطلب التوضيح المنهجي",
    descriptionAr: "التعامل مع سؤال عام مثل 'شغلي واگف وماكو شغل' بالسؤال عن الأرقام والقناة ونوع المنتج.",
    userPrompt: "شغلي واگف وماكو شغل، شنو الحل؟",
    expectedKeywords: ["منتج", "إعلانات", "رسائل", "تفاصيل", "سعر"],
    requiresCalculation: false,
    requiresClarificationQuestion: true,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "أهلاً بيك يا غالي. حتى أساعدك بدقة وما أعطيك كلام عام، أحتاج أعرف منك 3 تفاصيل سريعة:\n1. شنو نوع المنتج اللي تبيعه وشنو سعره وكلفته عليك؟\n2. معتمد على الإعلانات الممولة لو النشر المجاني؟ وكم رسالة تجيك يومياً؟\n3. هل المشكلة بعدم وجود رسائل أصلاً، لو بالرسائل اللي ما تتحول لطلبات؟\nجاوبني على هاي النقاط وخلي نحدد المشكلة بالضبط ونحلها.",
  },

  // 8. Two unrelated questions asked sequentially (Context Isolation)
  {
    id: "eval_unrelated_sequential_08",
    category: "unrelated_sequential_questions",
    titleAr: "عزل المواضيع ومنع تداخل السياقات",
    descriptionAr: "سؤال عن حسابات الاستيراد والجمارك بعد محادثة سابقة عن سكريبتات تثبيت الهاتف.",
    userPrompt: "شلون أحسب نسبة الضريبة والعمولة وكلفة التوصيل للمنتجات المستوردة من الصين لحساب التكلفة النهائية؟",
    previousTurnContext: [
      { role: "user", text: "اعطيني سكريبت لتثبيت طلبات المحافظات عبر الهاتف ومكالمة المندوب" },
      { role: "assistant", text: "هذا سكريبت مكالمة التثبيت: ألو سلام عليكم أخوية.. طالعلك المندوب اليوم..." },
    ],
    expectedKeywords: ["صين", "توصيل", "كلفة", "جمارك", "وزن", "حجم", "استيراد"],
    forbiddenContaminationKeywords: ["مكالمة المندوب", "ألو سلام عليكم", "طالعلك المندوب"],
    requiresCalculation: true,
    requiresClarificationQuestion: false,
    requiresConcreteAction: true,
    sampleGoldAnswer:
      "أهلاً بيك يا غالي. لحساب تكلفة استيراد الطلب من الصين للوصول لباب مستودعك بالعراق:\n1. تكلفة الشراء من المصنع (FOB/EXW) بالدولار.\n2. كلفة التوصيل الجوي أو البحري (حسب الكيلوغرام أو CBM).\n3. رسوم التخليص الجمركي والضريبة (تتراوح بين 5% إلى 15% حسب التصنيف).\n4. كلفة النقل الداخلي والمناولة.\nالمعادلة: كلفة القطعة الواصلة = (إجمالي الفاتورة + التوصيل + الجمارك) ÷ عدد القطع الفعلي المستلم.",
  },
];

/**
 * Dialect markers for professional Iraqi Arabic
 */
const IRAQI_DIALECT_MARKERS = [
  "بيك",
  "عيوني",
  "شلون",
  "علمود",
  "دينار",
  "راجع",
  "زبون",
  "طلب",
  "أوردر",
  "محافظات",
  "شغلك",
  "هسه",
  "تدلل",
  "تكدر",
  "يمك",
  "حبيبي",
  "حسابك",
  "كلفة",
  "توصيل",
  "مندوب",
];

/**
 * Evaluates an advisor response against a test case and returns a scored breakdown
 */
export function evaluateAdvisorResponse(
  testCase: AdvisorTestCase,
  responseText: string,
  _historyContext?: { role: string; text: string }[]
): TestCaseEvaluationReport {
  const text = (responseText || "")
    .toLowerCase()
    .replace(/[ـَُِّْٰ]/g, ""); // Remove Arabic diacritics / tatweel

  // 1. Topic Relevance Criterion (Root / Substring / Stem matching)
  const matchedKeywords = testCase.expectedKeywords.filter((kw) => {
    const cleanKw = kw.toLowerCase().replace(/[ـَُِّْٰ]/g, "");
    return (
      text.includes(cleanKw) ||
      text.includes(`ال${cleanKw}`) ||
      text.includes(`و${cleanKw}`) ||
      text.includes(`ب${cleanKw}`) ||
      text.includes(`ل${cleanKw}`) ||
      text.includes(`لل${cleanKw}`)
    );
  });

  const relevanceRatio =
    testCase.expectedKeywords.length > 0
      ? matchedKeywords.length / testCase.expectedKeywords.length
      : 1;
  const topicRelevancePassed = relevanceRatio >= 0.45;
  const topicRelevanceScore = Math.min(100, Math.round(relevanceRatio * 100));

  // 2. No Context Contamination Criterion
  let noContaminationPassed = true;
  let contaminationDetails = "سياق نظيف وخالٍ من التداخل مع محادثات سابقة.";
  if (testCase.forbiddenContaminationKeywords && testCase.forbiddenContaminationKeywords.length > 0) {
    const foundForbidden = testCase.forbiddenContaminationKeywords.filter((fKw) =>
      text.includes(fKw.toLowerCase())
    );
    if (foundForbidden.length > 0) {
      noContaminationPassed = false;
      contaminationDetails = `تم رصد تسرب سياق غير مرغوب فيه: ${foundForbidden.join(", ")}`;
    }
  }

  // 3. Concrete Next Action Criterion
  const hasNumberedList = /\b[1-3]\./.test(responseText) || text.includes("أول خطوة") || text.includes("خطوات") || text.includes("طبق");
  const hasScriptOrSop = text.includes("سكريبت") || text.includes("«") || text.includes("💬") || text.includes("الحل") || text.includes("معادلة");
  const hasConcreteAction = !testCase.requiresConcreteAction || hasNumberedList || hasScriptOrSop;
  const concreteActionScore = hasConcreteAction ? 100 : 40;

  // 4. Correct Calculations Criterion
  let calculationsPassed = true;
  let calculationScore = 100;
  if (testCase.requiresCalculation) {
    const hasNumbers = /\d+/.test(responseText);
    const hasUnits = text.includes("دينار") || text.includes("%") || text.includes("دولار") || text.includes("كلفة");
    calculationsPassed = hasNumbers && hasUnits;
    calculationScore = calculationsPassed ? 100 : 30;
  }

  // 5. Appropriate Uncertainty Criterion
  let uncertaintyPassed = true;
  let uncertaintyScore = 100;
  if (testCase.requiresClarificationQuestion) {
    const asksQuestions =
      text.includes("?") ||
      text.includes("؟") ||
      text.includes("شنو") ||
      text.includes("أحتاج أعرف") ||
      text.includes("جاوبني") ||
      text.includes("تفاصيل");
    uncertaintyPassed = asksQuestions;
    uncertaintyScore = uncertaintyPassed ? 100 : 35;
  }

  // 6. Iraqi Arabic Output Criterion
  const matchedIraqiDialect = IRAQI_DIALECT_MARKERS.filter((marker) =>
    text.includes(marker)
  );
  const iraqiDialectScore = Math.min(
    100,
    Math.round((matchedIraqiDialect.length / 3) * 100)
  );
  const iraqiPassed = iraqiDialectScore >= 60;

  // Overall Score Calculation (Weighted)
  const passedAll =
    topicRelevancePassed &&
    noContaminationPassed &&
    hasConcreteAction &&
    calculationsPassed &&
    uncertaintyPassed &&
    iraqiPassed;

  const overallScore = Math.round(
    topicRelevanceScore * 0.25 +
      (noContaminationPassed ? 100 : 0) * 0.2 +
      concreteActionScore * 0.15 +
      calculationScore * 0.15 +
      uncertaintyScore * 0.15 +
      iraqiDialectScore * 0.1
  );

  return {
    testCaseId: testCase.id,
    category: testCase.category,
    titleAr: testCase.titleAr,
    passedAll,
    overallScore,
    criteria: {
      topicRelevance: {
        passed: topicRelevancePassed,
        score: topicRelevanceScore,
        feedbackAr: topicRelevancePassed
          ? `مرتبط بشكل دقيق بالموضوع (${matchedKeywords.length}/${testCase.expectedKeywords.length} كلمات مفتاحية)`
          : `صلة الموضوع غير كافية (${matchedKeywords.length}/${testCase.expectedKeywords.length})`,
      },
      noContextContamination: {
        passed: noContaminationPassed,
        score: noContaminationPassed ? 100 : 0,
        feedbackAr: contaminationDetails,
      },
      concreteNextAction: {
        passed: hasConcreteAction,
        score: concreteActionScore,
        feedbackAr: hasConcreteAction
          ? "يحتوي على خطوات عملية واضحة (1-2-3) أو سكريبت جاهز للتطبيق."
          : "الرد يفتقر إلى خطوات تنفيذية محددة.",
      },
      correctCalculations: {
        passed: calculationsPassed,
        score: calculationScore,
        feedbackAr: calculationsPassed
          ? "استخدام سليم للأرقام وهيكل الحسابات بالدينار والنسب المئوية."
          : "الحسابات غير مكتملة أو تفتقر إلى وحدات القياس الصحيحة.",
      },
      appropriateUncertainty: {
        passed: uncertaintyPassed,
        score: uncertaintyScore,
        feedbackAr: uncertaintyPassed
          ? "تعامل سليم مع الغموض من خلال طلب التوضيحات اللازمة."
          : "افترض معلومات غير مذكورة دون طلب توضيح.",
      },
      iraqiArabicOutput: {
        passed: iraqiPassed,
        score: iraqiDialectScore,
        feedbackAr: iraqiPassed
          ? `لهجة عراقية مهنية ممتازة (${matchedIraqiDialect.slice(0, 4).join("، ")})`
          : "اللهجة تفتقر للمصطلحات العراقية المعتادة.",
      },
    },
  };
}

/**
 * Runs the full 8-benchmark evaluation suite against a collection of answers or standard reference gold answers
 */
export function runAdvisorEvaluationSuite(
  customAnswers?: Record<string, string>
): EvaluationSuiteSummary {
  const reports: TestCaseEvaluationReport[] = [];
  const categoryScores: Record<string, number> = {};

  let totalScoreSum = 0;
  let passedCount = 0;

  for (const testCase of ADVISOR_EVALUATION_DATASET) {
    const responseToTest =
      customAnswers?.[testCase.id] || testCase.sampleGoldAnswer || "";

    const report = evaluateAdvisorResponse(
      testCase,
      responseToTest,
      testCase.previousTurnContext
    );

    reports.push(report);

    if (report.passedAll) {
      passedCount++;
    }

    totalScoreSum += report.overallScore;
    categoryScores[testCase.category] = report.overallScore;
  }

  const totalTests = ADVISOR_EVALUATION_DATASET.length;
  const averageScore = Math.round(totalScoreSum / totalTests);

  return {
    timestamp: new Date().toISOString(),
    totalTests,
    passedTests: passedCount,
    failedTests: totalTests - passedCount,
    averageScore,
    categoryScores,
    reports,
  };
}
