export type UserRole = "USER" | "ADMIN";

export type CarStatus = "AVAILABLE" | "MAINTENANCE" | "DISABLED";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
}
