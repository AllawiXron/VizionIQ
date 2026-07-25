/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AccessCode {
  code: string;
  isRevoked: boolean;
  buyerName?: string;
  dateAdded: string;
}

// Basic ROI Calculator
export interface CalculatorInputs {
  budget: number;       // USD or Dinar
  cpm: number;          // Cost per 1000 Impressions
  ctr: number;          // Click-Through Rate (%)
  cvr: number;          // Conversion Rate on Store (%)
  productCost: number;  // Sourcing Cost
  shippingCost: number; // Delivery fee to customer
  sellingPrice: number; // Price of product sold
  deliveryRate: number; // Delivery Success Rate (%)
}

export interface CalculatorResults {
  impressions: number;
  clicks: number;
  orders: number;
  deliveredOrders: number;
  cpc: number;
  cpa: number;
  totalSpend: number;
  productSourcingCost: number;
  shippingCostTotal: number;
  revenue: number;
  netProfit: number;
  roi: number;
}

// 11 Chapters Structure
export interface ChapterItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  layer: string;
  description: string;
  readTime: string;
}

export interface ChapterDetailContent {
  id: string;
  chapterNumber?: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  layer?: string;
  description?: string;
  readTime?: string;
  coreFramework: {
    title: string;
    summary: string;
    sections: {
      heading: string;
      content: string;
      keyTakeaway?: string;
      bulletPoints?: string[];
    }[];
  };
  deepDive: {
    title: string;
    sections: {
      heading: string;
      content: string;
      examples?: string[];
      diagramInfo?: string;
    }[];
  };
  actionSteps: {
    step: number;
    title: string;
    description: string;
    timeframe: string;
  }[];
  commonMistakes: {
    mistake: string;
    whyItFails: string;
    fix: string;
  }[];
  advancedTactics: {
    title: string;
    description: string;
    impact: string;
  }[];
}

export interface PhoneScriptItem {
  title: string;
  customerType: string;
  psychologyNote: string;
  goldenOutcome: string;
  description?: string;
  tip?: string;
  dialog: { speaker: string; text: string; note?: string }[];
}


// Iraqi Case Study
export interface CaseStudy {
  id: string;
  chapterId: string;
  title: string;
  businessName: string;
  city: string;
  category: string;
  beforeMetrics: {
    roas: string;
    cpa: string;
    returnRate: string;
    dailyOrders: string;
  };
  afterMetrics: {
    roas: string;
    cpa: string;
    returnRate: string;
    dailyOrders: string;
  };
  theProblem: string;
  thePsychology: string;
  theOfferStack: string[];
  adCreativeHook: string;
  whatsappScriptSnippet: string;
  keyLearnings: string[];
}

// Swipe Files / Resources
export interface SwipeFile {
  id: string;
  chapterId: string;
  category: "ad_copy" | "whatsapp_script" | "product_page" | "confirmation_call" | "checklist" | "spreadsheet";
  title: string;
  description: string;
  content: string;
  dialect?: "بغدادي" | "بصراوي" | "فصحة بسيطة" | "كردي مائل للعربية" | "دارج (عراقي)";
  downloadUrl?: string;
}

// Video Lessons
export interface VideoLesson {
  id: string;
  chapterId: string;
  chapterNumber: string;
  title: string;
  duration: string;
  videoUrl?: string;
  thumbnailUrl: string;
  summary: string;
  timestamps: { time: string; label: string }[];
  keyTakeaways: string[];
  actionItem: string;
}

// Interactive Decision Tree
export interface DecisionTreeNode {
  id: string;
  question: string;
  explanation: string;
  options: {
    label: string;
    description: string;
    nextStepId?: string;
    result?: DiagnosticResult;
  }[];
}

export interface DiagnosticResult {
  title: string;
  severity: "critical" | "warning" | "optimal";
  rootCause: string;
  exactActionPlan: string[];
  recommendedTool: string;
  relatedSwipeFileId?: string;
}

// Scenario-based learning challenges
export interface ScenarioChallenge {
  id: string;
  title: string;
  difficulty: "مبتدئ" | "متوسط" | "متقدم خبير";
  scenarioDescription: string;
  budget: string;
  metricsGiven: string;
  question: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface DayTask {
  day: number;
  title: string;
  task?: string;
  details?: string;
  description?: string;
  category?: string;
  checklist?: string[];
  completed: boolean;
}
