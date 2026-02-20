/**
 * Utility functions for agreement handling and formatting
 */

import { AgreementType, SignatureStatus, AgreementStatus } from '@/types/index';

/**
 * Maps agreement type to display label
 *
 * @param type - Agreement type
 * @returns Human-readable label
 */
export function getAgreementTypeLabel(type: AgreementType): string {
  const labels: Record<AgreementType, string> = {
    'covered-entity': 'Covered Entity',
    'business-associate': 'Business Associate',
    subcontractor: 'Subcontractor',
  };
  return labels[type];
}

/**
 * Maps agreement type to Tailwind CSS color class
 * Used for visual distinction in UI components
 *
 * @param type - Agreement type
 * @returns Tailwind color class (e.g., 'bg-blue-100', 'text-green-700')
 */
export function getAgreementTypeColor(type: AgreementType): string {
  const colors: Record<AgreementType, string> = {
    'covered-entity': 'blue',
    'business-associate': 'green',
    subcontractor: 'purple',
  };
  return colors[type];
}

/**
 * Gets background color class for agreement type badge
 *
 * @param type - Agreement type
 * @returns Tailwind background class
 */
export function getAgreementTypeBgClass(type: AgreementType): string {
  const bgClasses: Record<AgreementType, string> = {
    'covered-entity': 'bg-blue-100',
    'business-associate': 'bg-green-100',
    subcontractor: 'bg-purple-100',
  };
  return bgClasses[type];
}

/**
 * Gets text color class for agreement type badge
 *
 * @param type - Agreement type
 * @returns Tailwind text class
 */
export function getAgreementTypeTextClass(type: AgreementType): string {
  const textClasses: Record<AgreementType, string> = {
    'covered-entity': 'text-blue-800',
    'business-associate': 'text-green-800',
    subcontractor: 'text-purple-800',
  };
  return textClasses[type];
}

/**
 * Formats date to user-friendly string
 * Example: "2024-01-15" -> "Jan 15, 2024"
 *
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats date with time
 * Example: "2024-01-15T10:30:00Z" -> "Jan 15, 2024 at 10:30 AM"
 *
 * @param dateString - ISO 8601 date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

/**
 * Maps signature status to display label
 *
 * @param status - Signature status
 * @returns Human-readable label
 */
export function getSignatureStatusLabel(status: SignatureStatus): string {
  const labels: Record<SignatureStatus, string> = {
    'fully-executed': 'Fully Executed',
    pending: 'Pending Signature',
    unsigned: 'Unsigned',
  };
  return labels[status];
}

/**
 * Gets color class for signature status badge
 *
 * @param status - Signature status
 * @returns Tailwind color class
 */
export function getSignatureStatusColor(status: SignatureStatus): string {
  const colors: Record<SignatureStatus, string> = {
    'fully-executed': 'green',
    pending: 'yellow',
    unsigned: 'red',
  };
  return colors[status];
}

/**
 * Maps agreement status to display label
 *
 * @param status - Agreement status
 * @returns Human-readable label
 */
export function getAgreementStatusLabel(status: AgreementStatus): string {
  const labels: Record<AgreementStatus, string> = {
    active: 'Active',
    expired: 'Expired',
    draft: 'Draft',
    terminated: 'Terminated',
  };
  return labels[status];
}

/**
 * Gets color class for agreement status badge
 *
 * @param status - Agreement status
 * @returns Tailwind color class
 */
export function getAgreementStatusColor(status: AgreementStatus): string {
  const colors: Record<AgreementStatus, string> = {
    active: 'green',
    expired: 'red',
    draft: 'gray',
    terminated: 'gray',
  };
  return colors[status];
}

/**
 * Formats relative time
 * Example: "2024-01-15" (today) -> "Today"
 * Example: "2024-01-16" (tomorrow) -> "Tomorrow"
 * Example: "2024-01-20" (in 5 days) -> "In 5 days"
 *
 * @param dateString - ISO 8601 date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time portion for comparison
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  } catch {
    return dateString;
  }
}

/**
 * Calculates days until date
 *
 * @param dateString - ISO 8601 date string
 * @returns Number of days (negative if in past)
 */
export function daysUntilDate(dateString: string): number {
  try {
    const date = new Date(dateString);
    const today = new Date();

    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Checks if a date is within the next N days
 *
 * @param dateString - ISO 8601 date string
 * @param days - Number of days threshold
 * @returns Boolean
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const daysRemaining = daysUntilDate(dateString);
  return daysRemaining >= 0 && daysRemaining <= days;
}

/**
 * Formats a number as percentage
 *
 * @param value - Number between 0-100
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats hours as readable duration
 * Example: 24 -> "24 hours"
 * Example: 48 -> "2 days"
 *
 * @param hours - Number of hours
 * @returns Readable duration string
 */
export function formatHoursDuration(hours: number): string {
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}
