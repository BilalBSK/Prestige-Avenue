export type UserRole = "USER" | "ADMIN";

export type CarStatus = "AVAILABLE" | "MAINTENANCE" | "DISABLED";

export type BookingStatus =
  | "PENDING_REVIEW"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED";

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
}
