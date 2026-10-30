import type { PaymentStatus } from "./api";

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = "card" | "bank_transfer" | "cash";

export interface Transaction {
  id: string;
  paymentId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  providerResponse?: Record<string, unknown>;
  createdAt: string;
}

export type TransactionType = "charge" | "refund" | "payout";
export type TransactionStatus = "pending" | "success" | "failed";

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
}

export type RefundStatus = "pending" | "approved" | "rejected" | "completed";
