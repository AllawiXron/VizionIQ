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

export interface ChapterCard {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface DayTask {
  day: number;
  title: string;
  task: string;
  details: string;
  completed: boolean;
}
