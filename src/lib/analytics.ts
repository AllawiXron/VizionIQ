/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Privacy-Conscious Product Analytics Engine for Vizion Platform.
 * 
 * STRICT PRIVACY DIRECTIVE:
 * - Tracks only structured product lifecycle events.
 * - NEVER logs raw user prompts, private customer messages, customer phone numbers,
 *   full business profiles, passwords, API keys, or full advisor conversations.
 * - Enforces zero-PII scrubbing and attribute sanitization.
 */

export type AnalyticsEventType =
  | "landing_viewed"
  | "diagnosis_started"
  | "diagnosis_completed"
  | "chapter_opened"
  | "exercise_completed"
  | "tool_opened"
  | "advisor_prompt_submitted"
  | "advisor_answer_completed"
  | "advisor_answer_copied"
  | "advisor_recommendation_opened"
  | "plan_step_completed"
  | "plan_completed"
  | "advisor_feedback_submitted";

export type FeedbackRating = "helpful" | "unhelpful";

export type FeedbackReason =
  | "عام جداً"
  | "مو مرتبط بسؤالي"
  | "الحساب غير واضح"
  | "أريد تفاصيل أكثر"
  | "too_generic"
  | "not_relevant"
  | "unclear_calculation"
  | "need_more_details";

export interface AnalyticsEventPayload {
  eventType: AnalyticsEventType;
  timestamp: number;
  properties: Record<string, string | number | boolean | undefined>;
}

export interface AnalyticsSummary {
  totalEvents: number;
  eventsByType: Record<AnalyticsEventType, number>;
  feedback: {
    total: number;
    helpfulCount: number;
    unhelpfulCount: number;
    helpfulPercentage: number;
    reasonsBreakdown: Record<string, number>;
  };
  recentEvents: AnalyticsEventPayload[];
}

const STORAGE_KEY_EVENTS = "vizion_analytics_events_v1";
const STORAGE_KEY_AGGREGATES = "vizion_analytics_aggregates_v1";
const MAX_STORED_EVENTS = 200;

// Allowed non-PII attribute keys
const ALLOWED_PROPERTY_KEYS = new Set([
  "chapterId",
  "chapterNumber",
  "toolId",
  "toolCategory",
  "exerciseId",
  "exerciseScore",
  "planDay",
  "planCompletedCount",
  "topicId",
  "promptCategory",
  "rating",
  "reason",
  "latencyMs",
  "hasRecommendations",
  "hasScript",
  "wordCount",
  "isError",
  "source",
  "actionType",
  "targetId",
  "requestId",
]);

let memoryEvents: AnalyticsEventPayload[] = [];
let memoryAggregates: Record<string, number> = {};

/**
 * Strips any potential PII or private strings from properties
 */
export function sanitizeAnalyticsProperties(
  props?: Record<string, any>
): Record<string, string | number | boolean> {
  if (!props || typeof props !== "object") return {};

  const clean: Record<string, string | number | boolean> = {};

  for (const [key, val] of Object.entries(props)) {
    // Only accept allowed safe property keys
    if (!ALLOWED_PROPERTY_KEYS.has(key)) {
      continue;
    }

    if (typeof val === "boolean" || typeof val === "number") {
      clean[key] = val;
    } else if (typeof val === "string") {
      // Scrub any Iraqi phone numbers (e.g. 07XXXXXXXX) or emails or API keys
      let safeStr = val
        .replace(/07[3-9]\d{8}/g, "[PHONE_REDACTED]")
        .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, "[EMAIL_REDACTED]")
        .replace(/AIza[0-9A-Za-z-_]{35}/g, "[KEY_REDACTED]");

      // Limit length to avoid storing large text blocks
      if (safeStr.length > 80) {
        safeStr = safeStr.substring(0, 80);
      }
      clean[key] = safeStr;
    }
  }

  return clean;
}

/**
 * Central event tracking function
 */
export function trackEvent(
  eventType: AnalyticsEventType,
  properties?: Record<string, any>
): AnalyticsEventPayload {
  const safeProps = sanitizeAnalyticsProperties(properties);
  const eventPayload: AnalyticsEventPayload = {
    eventType,
    timestamp: Date.now(),
    properties: safeProps,
  };

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      // 1. Update In-Memory / Local Storage Event Log
      const rawExisting = localStorage.getItem(STORAGE_KEY_EVENTS);
      const existing: AnalyticsEventPayload[] = rawExisting ? JSON.parse(rawExisting) : [];
      
      // Maintain sliding window of events
      const updated = [eventPayload, ...existing].slice(0, MAX_STORED_EVENTS);
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));

      // 2. Update Fast Aggregates
      const rawAggregates = localStorage.getItem(STORAGE_KEY_AGGREGATES);
      const aggregates: Record<string, number> = rawAggregates ? JSON.parse(rawAggregates) : {};
      aggregates[eventType] = (aggregates[eventType] || 0) + 1;
      localStorage.setItem(STORAGE_KEY_AGGREGATES, JSON.stringify(aggregates));

      // 3. Dispatch window custom event for reactive UI updates
      window.dispatchEvent(
        new CustomEvent("vizion-analytics-event", {
          detail: eventPayload,
        })
      );
    } else {
      memoryEvents = [eventPayload, ...memoryEvents].slice(0, MAX_STORED_EVENTS);
      memoryAggregates[eventType] = (memoryAggregates[eventType] || 0) + 1;
    }

    return eventPayload;
  } catch (err) {
    console.warn("[Vizion Analytics] Telemetry save error (safe fallback):", err);
    return eventPayload;
  }
}

/**
 * Returns aggregated analytics summary for admin and quality review
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  const defaultSummary: AnalyticsSummary = {
    totalEvents: 0,
    eventsByType: {
      landing_viewed: 0,
      diagnosis_started: 0,
      diagnosis_completed: 0,
      chapter_opened: 0,
      exercise_completed: 0,
      tool_opened: 0,
      advisor_prompt_submitted: 0,
      advisor_answer_completed: 0,
      advisor_answer_copied: 0,
      advisor_recommendation_opened: 0,
      plan_step_completed: 0,
      plan_completed: 0,
      advisor_feedback_submitted: 0,
    },
    feedback: {
      total: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      helpfulPercentage: 100,
      reasonsBreakdown: {},
    },
    recentEvents: [],
  };

  try {
    let events: AnalyticsEventPayload[] = [];
    let aggregates: Record<string, number> = {};

    if (typeof window !== "undefined" && window.localStorage) {
      const rawEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      events = rawEvents ? JSON.parse(rawEvents) : [];
      
      const rawAggregates = localStorage.getItem(STORAGE_KEY_AGGREGATES);
      aggregates = rawAggregates ? JSON.parse(rawAggregates) : {};
    } else {
      events = memoryEvents;
      aggregates = memoryAggregates;
    }

    let total = 0;
    const eventsByType: Record<AnalyticsEventType, number> = { ...defaultSummary.eventsByType };

    for (const key of Object.keys(eventsByType) as AnalyticsEventType[]) {
      eventsByType[key] = aggregates[key] || 0;
      total += eventsByType[key];
    }

    // Feedback calculations
    let helpful = 0;
    let unhelpful = 0;
    const reasonsBreakdown: Record<string, number> = {};

    events.forEach((ev) => {
      if (ev.eventType === "advisor_feedback_submitted") {
        const rating = ev.properties?.rating;
        const reason = ev.properties?.reason;

        if (rating === "helpful") helpful++;
        if (rating === "unhelpful") unhelpful++;

        if (reason && typeof reason === "string") {
          reasonsBreakdown[reason] = (reasonsBreakdown[reason] || 0) + 1;
        }
      }
    });

    const feedbackTotal = helpful + unhelpful;
    const helpfulPercentage =
      feedbackTotal > 0 ? Math.round((helpful / feedbackTotal) * 100) : 100;

    return {
      totalEvents: total,
      eventsByType,
      feedback: {
        total: feedbackTotal,
        helpfulCount: helpful,
        unhelpfulCount: unhelpful,
        helpfulPercentage,
        reasonsBreakdown,
      },
      recentEvents: events.slice(0, 30),
    };
  } catch (err) {
    console.error("Failed to read analytics summary", err);
    return defaultSummary;
  }
}

/**
 * Clear analytics data
 */
export function clearAnalyticsData(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_EVENTS);
    localStorage.removeItem(STORAGE_KEY_AGGREGATES);
    window.dispatchEvent(new CustomEvent("vizion-analytics-event"));
  }
  memoryEvents = [];
  memoryAggregates = {};
}
