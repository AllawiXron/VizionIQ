/**
 * Typed mapping between Vizion AI Advisor topics, course chapters, and interactive tools.
 * Uses stable IDs and safe validation to prevent broken links and ensure safe navigation.
 */

export interface AdvisorActionConfig {
  topicId: string;
  topicNameAr: string;
  relevanceReasonAr: string;
  toolId?: string;
  toolTitleAr?: string;
  toolCategory?: "understand" | "calculate" | "optimize" | "execute";
  chapterId?: string;
  chapterTitleAr?: string;
  chapterNumberAr?: string;
  defaultTaskForPlan?: string;
  scriptType?: "whatsapp" | "ad_copy" | "call_script" | "general_sop";
}

export interface SavedRecommendation {
  id: string;
  title: string;
  reason: string;
  text: string;
  timestamp: string;
  topicId?: string;
  chapterId?: string;
  chapterTitle?: string;
  toolId?: string;
  toolTitle?: string;
  script?: string;
}

export interface PlanTaskItem {
  id: string;
  day: number;
  title: string;
  details: string;
  topicId?: string;
  toolId?: string;
  chapterId?: string;
  isCustom?: boolean;
  completed: boolean;
  addedAt: string;
}

// 1. Stable, Valid Chapter IDs from chaptersList
export const VALID_CHAPTER_IDS = [
  "chapter1",
  "chapter2",
  "chapter3",
  "chapter4",
  "chapter5",
  "chapter6",
  "chapter7",
  "chapter8",
  "chapter9",
  "chapter10",
  "chapter11",
] as const;

export type ValidChapterId = (typeof VALID_CHAPTER_IDS)[number];

// 2. Stable, Valid Tool IDs from VizionGrowthSuite
export const VALID_TOOL_IDS = [
  "diagnostics",
  "sales-blocker",
  "customer-types",
  "competitors",
  "pricing-calculator",
  "profit-leak",
  "forecaster",
  "budget-planner",
  "campaign-advisor",
  "message-diagnoser",
  "product-evaluator",
  "ads-library",
  "roadmap",
] as const;

export type ValidToolId = (typeof VALID_TOOL_IDS)[number];

// 3. Typed Mapping Registry linking Stable Topic IDs to Chapters and Tools
export const ADVISOR_TOPIC_REGISTRY: Record<string, AdvisorActionConfig> = {
  // Ads & Campaign Optimization
  topic_ads_low_conversion: {
    topicId: "topic_ads_low_conversion",
    topicNameAr: "رسائل كثيرة ونسبة تحويل منخفضة",
    relevanceReasonAr: "نسبة التحويل من الرسائل ضعيفة، تحتاج فحص جودة المحادثات وتطبيق سكريبتات إغلاق فورية.",
    toolId: "message-diagnoser",
    toolTitleAr: "أداة جودة الرسائل ومعدل التحويل",
    toolCategory: "optimize",
    chapterId: "chapter7",
    chapterTitleAr: "احتراف مبيعات الواتساب والخاص",
    chapterNumberAr: "الفصل السابع",
    defaultTaskForPlan: "تطبيق قاعدة الـ 2 دقيقة وبصمة الصوت الدافية مع أول 10 مستفسرين عبر الواتساب.",
    scriptType: "whatsapp",
  },
  topic_ads_high_cpa: {
    topicId: "topic_ads_high_cpa",
    topicNameAr: "كلفة الرسالة والإعلان مرتفعة",
    relevanceReasonAr: "كلفة الرسالة تلتهم هامش ربحك، تحتاج تحسين الخطاف البصري (Hook) في أول 3 ثوانٍ وفحص الحملة.",
    toolId: "campaign-advisor",
    toolTitleAr: "مستشار الحملات الإعلانية",
    toolCategory: "optimize",
    chapterId: "chapter4",
    chapterTitleAr: "طريقة الإعلانات ومقاييس النجاح",
    chapterNumberAr: "الفصل الرابع",
    defaultTaskForPlan: "إعادة تصوير هوك إعلاني واقعي لمدة 3 ثوانٍ وإعادة اختبار الإعلان بميزانية تجريبية.",
    scriptType: "ad_copy",
  },
  topic_ad_fatigue: {
    topicId: "topic_ad_fatigue",
    topicNameAr: "احتراق الإعلان وتذبذب النتائج",
    relevanceReasonAr: "الجمهور تشبع من نفس زاوية الإعلان، يجب تنويع زوايا المحتوى (Angles) وتوسيع الاستهداف.",
    toolId: "ads-library",
    toolTitleAr: "مكتبة الإعلانات والزوايا الناجحة",
    toolCategory: "optimize",
    chapterId: "chapter5",
    chapterTitleAr: "صناعة المحتوى وطريقة الكلام",
    chapterNumberAr: "الفصل الخامس",
    defaultTaskForPlan: "ابتكار زاويتين إعلانيتين جديدتين (زاوية حل المشكلة وزاوية الكشخة والضمان).",
    scriptType: "ad_copy",
  },

  // Sales Objections & Closing
  topic_sales_price_objection: {
    topicId: "topic_sales_price_objection",
    topicNameAr: "اعتراض 'السعر غالي ومبالغ بيه'",
    relevanceReasonAr: "الزبون يقارن السعر دون إدراك القيمة الحقيقية، استخدم سكريبت إبراز القيمة وضمان الاستلام.",
    toolId: "customer-types",
    toolTitleAr: "دليل أنواع الزبائن وردود الإغلاق",
    toolCategory: "understand",
    chapterId: "chapter7",
    chapterTitleAr: "احتراف مبيعات الواتساب والخاص",
    chapterNumberAr: "الفصل السابع",
    defaultTaskForPlan: "تجهيز قالب رد سريع على اعتراض السعر يركز على الكفالة وتجربة الفحص كدام المندوب.",
    scriptType: "whatsapp",
  },
  topic_sales_hesitation: {
    topicId: "topic_sales_hesitation",
    topicNameAr: "تسويف الزبون: 'بعدين أردلك خبر'",
    relevanceReasonAr: "الزبون يماطل لعدم وجود دافع استعجال (Urgency)، طبّق طريقة الإغلاق بالسؤال البديل.",
    toolId: "customer-types",
    toolTitleAr: "دليل أنواع الزبائن وردود الإغلاق",
    toolCategory: "understand",
    chapterId: "chapter7",
    chapterTitleAr: "احتراف مبيعات الواتساب والخاص",
    chapterNumberAr: "الفصل السابع",
    defaultTaskForPlan: "إرسال رسالة متابعة ذكية بعد 24 ساعة بعرض كمية محدودة لغلق الطلب المتردد.",
    scriptType: "whatsapp",
  },
  topic_sales_discount: {
    topicId: "topic_sales_discount",
    topicNameAr: "طلب التخفيض أو التوصيل المجاني",
    relevanceReasonAr: "بدل حرق السعر وخسارة الأرباح، قدّم عرض باكيج (قطعتين + هدية) أو ادمج التوصيل بذكاء.",
    toolId: "pricing-calculator",
    toolTitleAr: "حاسبة التسعير والربح الصافي",
    toolCategory: "calculate",
    chapterId: "chapter2",
    chapterTitleAr: "ترتيب العرض وتنسيق الهدايا",
    chapterNumberAr: "الفصل الثاني",
    defaultTaskForPlan: "صياغة باكيج عائلي أو زوجي يحافظ على هامش ربح أعلى من 40% مع توصيل مجاني محسوب.",
    scriptType: "whatsapp",
  },

  // Delivery & Returns Mitigation
  topic_delivery_returns: {
    topicId: "topic_delivery_returns",
    topicNameAr: "ارتفاع نسبة الراجع والمرتجع بالمحافظات",
    relevanceReasonAr: "الراجع يستنزف السيولة النقدية، احسب كلفة التسرب واعتمد مكالمة التثبيت قبل خروج الطلب.",
    toolId: "profit-leak",
    toolTitleAr: "كاشف تسرب الأرباح والراجع",
    toolCategory: "calculate",
    chapterId: "chapter9",
    chapterTitleAr: "تحليل المرتجعات وحل المشاكل",
    chapterNumberAr: "الفصل التاسع",
    defaultTaskForPlan: "تطبيق مكالمة التثبيت الصباحية قبل إرسال كشف التوصيل لشركة التوصيل لخفض الراجع لأقل من 10%.",
    scriptType: "call_script",
  },
  topic_delivery_confirmation: {
    topicId: "topic_delivery_confirmation",
    topicNameAr: "المكالمة الذهبية لتأكيد الطلب",
    relevanceReasonAr: "تأكيد العنوان ورقم الزبون البديل يضمن جاهزية الزبون للاستلام من المندوب فوراً.",
    toolId: "customer-types",
    toolTitleAr: "دليل أنواع الزبائن والمكالمات",
    toolCategory: "understand",
    chapterId: "chapter8",
    chapterTitleAr: "ترتيب التوصيل والدفع عند الاستلام",
    chapterNumberAr: "الفصل الثامن",
    defaultTaskForPlan: "الاتصال بجميع طلبات اليوم المسجلة والتأكد من العنوان الدقيق وتوفير كاش المندوب.",
    scriptType: "call_script",
  },
  topic_delivery_driver: {
    topicId: "topic_delivery_driver",
    topicNameAr: "تأخير المناديب ومشاكل التوصيل",
    relevanceReasonAr: "بناء علاقة مباشرة مع مناديب المحافظات ومتابعة الكشوفات يرفع نسبة التسليم الناجح.",
    toolId: "profit-leak",
    toolTitleAr: "كاشف تسرب الأرباح والراجع",
    toolCategory: "calculate",
    chapterId: "chapter8",
    chapterTitleAr: "ترتيب التوصيل والدفع عند الاستلام",
    chapterNumberAr: "الفصل الثامن",
    defaultTaskForPlan: "مراجعة كشف شركة التوصيل والاتصال بالزبائن العالقين في حالة 'لم يرد' أو 'مؤجل'.",
    scriptType: "general_sop",
  },

  // Financial Structure & Pricing
  topic_pricing_profit: {
    topicId: "topic_pricing_profit",
    topicNameAr: "هيكل التسعير وقاعدة 50/30/20",
    relevanceReasonAr: "يجب ألا يقل هامش الربح الإجمالي عن 3 أضعاف كلفة التوصيل والإعلان لضمان سيولة كاش مستقرة.",
    toolId: "pricing-calculator",
    toolTitleAr: "حاسبة التسعير والربح الصافي",
    toolCategory: "calculate",
    chapterId: "chapter3",
    chapterTitleAr: "طريقة التسعير وحساب الأرباح الصافية",
    chapterNumberAr: "الفصل الثالث",
    defaultTaskForPlan: "إعادة احتساب التكاليف الخفية لكل قطعة مباعة وفق قاعدة 50/30/20.",
    scriptType: "general_sop",
  },
  topic_budget_planning: {
    topicId: "topic_budget_planning",
    topicNameAr: "تخطيط الميزانية وتوقع الأرباح",
    relevanceReasonAr: "تحديد الميزانية الإعلانية اليومية المطلوبة للوصول إلى هدف الأرباح الصافية بدقة.",
    toolId: "budget-planner",
    toolTitleAr: "مخطط الميزانية الإعلانية",
    toolCategory: "calculate",
    chapterId: "chapter10",
    chapterTitleAr: "متابعة الأرقام واتخاذ القرارات",
    chapterNumberAr: "الفصل العاشر",
    defaultTaskForPlan: "وضع جدول أسبوعي لتوزيع الميزانية الإعلانية ومراقبة مؤشر الـ ROAS يومياً.",
    scriptType: "general_sop",
  },

  // Product Selection & Competitors
  topic_product_selection: {
    topicId: "topic_product_selection",
    topicNameAr: "اختيار وتقييم المنتج الرابح",
    relevanceReasonAr: "فحص مواصفات المنتج الرابح وتأكيد تحمله للتوصيل قبل إنفاق ميزانية الإعلانات.",
    toolId: "product-evaluator",
    toolTitleAr: "أداة تقييم فكرة المنتج",
    toolCategory: "optimize",
    chapterId: "chapter1",
    chapterTitleAr: "تحليل السوق وتفكير المشتري",
    chapterNumberAr: "الفصل الأول",
    defaultTaskForPlan: "تقييم منتجك عبر معايير منظومة فيزيون الـ 6 والتأكد من توفر هامش ربح لا يقل عن 15,000 د.ع.",
    scriptType: "general_sop",
  },
  topic_competitors: {
    topicId: "topic_competitors",
    topicNameAr: "تحليل المنافسين واقتناص الفرص",
    relevanceReasonAr: "معرفة نقاط ضعف الصفحات المنافسة واستغلالها بتقديم زاوية تصوير وضمان لا يقدمه غيرك.",
    toolId: "competitors",
    toolTitleAr: "محلل المنافسين والمحتوى",
    toolCategory: "understand",
    chapterId: "chapter1",
    chapterTitleAr: "تحليل السوق وتفكير المشتري",
    chapterNumberAr: "الفصل الأول",
    defaultTaskForPlan: "تحليل 3 صفحات منافسة في مجالك وتحديد ثغرة الردود أو المحتوى التي تكدر التفوق بها.",
    scriptType: "general_sop",
  },

  // General Diagnostic & Roadmap
  topic_general_diagnostic: {
    topicId: "topic_general_diagnostic",
    topicNameAr: "الفحص الشامل لواقع المشروع",
    relevanceReasonAr: "تشخيص متكامل يربط بين معدل التحويل، كلفة التوصيل، والربحية الصافية بالأرقام.",
    toolId: "diagnostics",
    toolTitleAr: "أداة فحص صحة المشروع",
    toolCategory: "understand",
    chapterId: "chapter10",
    chapterTitleAr: "متابعة الأرقام واتخاذ القرارات",
    chapterNumberAr: "الفصل العاشر",
    defaultTaskForPlan: "مراجعة معدل التحويل اليومي وحساب كلفة الرسائل الفعلية لمطابقتها مع المعايير.",
    scriptType: "general_sop",
  },
  topic_roadmap: {
    topicId: "topic_roadmap",
    topicNameAr: "خطة تشغيل الـ 100 طلب الأولى",
    relevanceReasonAr: "خطة عمل يومية متسلسلة للمرور بمراحل التأسيس، الإعلان، وتأكيد الطلبات خطوة بخطوة.",
    toolId: "roadmap",
    toolTitleAr: "مخطط الـ 100 طلب التفاعلي",
    toolCategory: "execute",
    chapterId: "chapter11",
    chapterTitleAr: "النمو وتكبير الشغل",
    chapterNumberAr: "الفصل الحادي عشر",
    defaultTaskForPlan: "تنفيذ مهام الأسبوع الأول من خارطة الطريق لتأمين الأساس المالي والمحتوى.",
    scriptType: "general_sop",
  },
};

/**
 * Fallback action configuration when no specific topic ID matches.
 * Directs the merchant to the general diagnostic tool and core chapter safely.
 */
export const DEFAULT_FALLBACK_ACTION: AdvisorActionConfig = {
  topicId: "topic_general_diagnostic",
  topicNameAr: "استشارة ومتابعة شاملة",
  relevanceReasonAr: "لتحقيق أفضل نتيجة، قارن أرقامك مع مقاييس كورس فيزيون وأدوات التشغيل التفاعلية.",
  toolId: "diagnostics",
  toolTitleAr: "أداة فحص صحة المشروع",
  toolCategory: "understand",
  chapterId: "chapter10",
  chapterTitleAr: "متابعة الأرقام واتخاذ القرارات",
  chapterNumberAr: "الفصل العاشر",
  defaultTaskForPlan: "متابعة مؤشرات الأداء الحيوية لحملاتك والتأكد من إغلاق المبيعات.",
  scriptType: "general_sop",
};

/**
 * Validates whether a chapterId is defined in the system.
 */
export function isValidChapterId(chapterId?: string): chapterId is ValidChapterId {
  if (!chapterId) return false;
  return VALID_CHAPTER_IDS.includes(chapterId as ValidChapterId);
}

/**
 * Validates whether a toolId is defined in the system.
 */
export function isValidToolId(toolId?: string): toolId is ValidToolId {
  if (!toolId) return false;
  return VALID_TOOL_IDS.includes(toolId as ValidToolId);
}

/**
 * Retrieves the action mapping for a specific topic ID with strict validation.
 */
export function getAdvisorActionForTopic(topicId?: string): AdvisorActionConfig {
  if (topicId && ADVISOR_TOPIC_REGISTRY[topicId]) {
    return ADVISOR_TOPIC_REGISTRY[topicId];
  }
  return DEFAULT_FALLBACK_ACTION;
}

/**
 * Intelligently maps an advisor response text or diagnosed bottleneck to the most relevant stable action.
 * Analyzes keywords in Arabic while ensuring only verified chapters and tools are returned.
 */
export function resolveAdvisorActionFromContent(
  text: string,
  explicitTopicId?: string
): AdvisorActionConfig {
  if (explicitTopicId && ADVISOR_TOPIC_REGISTRY[explicitTopicId]) {
    return ADVISOR_TOPIC_REGISTRY[explicitTopicId];
  }

  if (!text) return DEFAULT_FALLBACK_ACTION;

  const lower = text.toLowerCase();

  // 1. Returns / Delivery issues
  if (
    lower.includes("راجع") ||
    lower.includes("المرتجع") ||
    lower.includes("نسبة الراجع") ||
    lower.includes("توصيل") ||
    lower.includes("مندوب")
  ) {
    if (lower.includes("تثبيت") || lower.includes("مكالمة") || lower.includes("تأكيد")) {
      return ADVISOR_TOPIC_REGISTRY.topic_delivery_confirmation;
    }
    return ADVISOR_TOPIC_REGISTRY.topic_delivery_returns;
  }

  // 2. Sales objections / WhatsApp closing
  if (
    lower.includes("واتساب") ||
    lower.includes("محادثة") ||
    lower.includes("إغلاق") ||
    lower.includes("الردود") ||
    lower.includes("الخاص")
  ) {
    if (lower.includes("غالي") || lower.includes("السعر")) {
      return ADVISOR_TOPIC_REGISTRY.topic_sales_price_objection;
    }
    if (lower.includes("بعدين") || lower.includes("استشير") || lower.includes("تسويف")) {
      return ADVISOR_TOPIC_REGISTRY.topic_sales_hesitation;
    }
    return ADVISOR_TOPIC_REGISTRY.topic_ads_low_conversion;
  }

  // 3. Pricing / Profit Margin
  if (
    lower.includes("تسعير") ||
    lower.includes("صافي الربح") ||
    lower.includes("هامش الربح") ||
    lower.includes("كلفة المنتج")
  ) {
    return ADVISOR_TOPIC_REGISTRY.topic_pricing_profit;
  }

  // 4. Ads / High Cost / CPA / Hook
  if (
    lower.includes("إعلان") ||
    lower.includes("كلفة الرسالة") ||
    lower.includes("cpa") ||
    lower.includes("حملة") ||
    lower.includes("فيسبوك") ||
    lower.includes("تيك توك")
  ) {
    if (lower.includes("احتراق") || lower.includes("fatigue") || lower.includes("زوايا")) {
      return ADVISOR_TOPIC_REGISTRY.topic_ad_fatigue;
    }
    return ADVISOR_TOPIC_REGISTRY.topic_ads_high_cpa;
  }

  // 5. Product Evaluation / Competitors
  if (lower.includes("منتج رابح") || lower.includes("تقييم المنتج") || lower.includes("فكرة المنتج")) {
    return ADVISOR_TOPIC_REGISTRY.topic_product_selection;
  }
  if (lower.includes("منافسين") || lower.includes("المنافس")) {
    return ADVISOR_TOPIC_REGISTRY.topic_competitors;
  }

  // Default fallback
  return DEFAULT_FALLBACK_ACTION;
}

// -----------------------------------------------------------------------------------------
// Storage Helpers for Saved Recommendations & 7-Day Plan
// -----------------------------------------------------------------------------------------

export const getSavedRecommendationsStorageKey = (userCode?: string): string => {
  const code = userCode?.trim() || "guest";
  return `sales_guide_saved_recommendations_${code}`;
};

export const get7DayPlanStorageKey = (userCode?: string): string => {
  const code = userCode?.trim() || "guest";
  return `sales_guide_7day_custom_plan_${code}`;
};

/**
 * Saves a recommendation card or script locally.
 */
export function saveRecommendationToStorage(
  rec: Omit<SavedRecommendation, "id" | "timestamp">,
  userCode?: string
): { success: boolean; id: string } {
  if (typeof window === "undefined") return { success: false, id: "" };
  try {
    const key = getSavedRecommendationsStorageKey(userCode);
    const existing: SavedRecommendation[] = JSON.parse(localStorage.getItem(key) || "[]");
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: SavedRecommendation = {
      ...rec,
      id,
      timestamp: new Date().toLocaleDateString("ar-IQ", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = [newEntry, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
    return { success: true, id };
  } catch (e) {
    console.error("Failed to save recommendation:", e);
    return { success: false, id: "" };
  }
}

/**
 * Loads all saved recommendations for the current user.
 */
export function getSavedRecommendationsFromStorage(userCode?: string): SavedRecommendation[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getSavedRecommendationsStorageKey(userCode);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load saved recommendations:", e);
    return [];
  }
}

/**
 * Removes a saved recommendation by ID.
 */
export function removeSavedRecommendationFromStorage(id: string, userCode?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = getSavedRecommendationsStorageKey(userCode);
    const existing: SavedRecommendation[] = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error("Failed to delete saved recommendation:", e);
    return false;
  }
}

/**
 * Adds a recommended action into the user's 7-Day Plan.
 */
export function addRecommendationTo7DayPlanStorage(
  task: {
    title: string;
    details: string;
    topicId?: string;
    toolId?: string;
    chapterId?: string;
  },
  userCode?: string
): { success: boolean; task: PlanTaskItem | null } {
  if (typeof window === "undefined") return { success: false, task: null };
  try {
    const key = get7DayPlanStorageKey(userCode);
    const existing: PlanTaskItem[] = JSON.parse(localStorage.getItem(key) || "[]");
    
    // Assign next logical day (1 through 7)
    const nextDay = Math.min(7, (existing.length % 7) + 1);
    const id = `plan_task_${Date.now()}`;
    
    const newTask: PlanTaskItem = {
      id,
      day: nextDay,
      title: task.title,
      details: task.details,
      topicId: task.topicId,
      toolId: task.toolId,
      chapterId: task.chapterId,
      isCustom: true,
      completed: false,
      addedAt: new Date().toLocaleDateString("ar-IQ", { month: "short", day: "numeric" }),
    };

    const updated = [...existing, newTask];
    localStorage.setItem(key, JSON.stringify(updated));
    return { success: true, task: newTask };
  } catch (e) {
    console.error("Failed to add task to 7-day plan:", e);
    return { success: false, task: null };
  }
}

/**
 * Safe anonymous click tracking.
 * NEVER logs prompts, numbers, names, or private business data.
 */
export function trackAdvisorAction(
  actionType: "open_chapter" | "open_tool" | "copy_script" | "save_recommendation" | "add_to_plan",
  targetId: string
): void {
  // Only log event type and stable ID for telemetry
  if (typeof window !== "undefined") {
    try {
      const eventDetail = {
        actionType,
        targetId: targetId.replace(/[^a-zA-Z0-9_-]/g, ""),
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent("advisor-action-tracked", { detail: eventDetail }));
    } catch {
      // Silent telemetry failure
    }
  }
}
