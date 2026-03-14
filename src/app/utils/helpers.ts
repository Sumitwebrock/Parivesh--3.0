/**
 * PARIVESH 3.0 Utility Functions
 * Helper functions for common operations across the portal
 */

/**
 * Format date to Indian format (DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get status color based on application status
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'Under Scrutiny': 'blue',
    'EDS Raised': 'orange',
    'Verified': 'green',
    'Referred': 'teal',
    'MoM Generated': 'green',
    'Draft': 'gray',
    'Submitted': 'blue',
    'Finalized': 'green',
  };
  return colorMap[status] || 'gray';
}

/**
 * Generate application ID
 */
export function generateApplicationId(category: string, year: number = new Date().getFullYear()): string {
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `EC/${year}/${random}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate mobile number (Indian format)
 */
export function isValidMobile(mobile: string): boolean {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return formatDate(date);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate random color for avatars
 */
export function getAvatarColor(name: string): string {
  const colors = [
    '#1A5C1A', '#003087', '#FF6B00', '#7B1FA2', 
    '#2E7D32', '#1976D2', '#E65100', '#6A1B9A'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if user has permission for a route
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    'admin': 4,
    'mom': 3,
    'scrutiny': 2,
    'proponent': 1,
  };
  return (roleHierarchy[userRole.toLowerCase()] || 0) >= (roleHierarchy[requiredRole.toLowerCase()] || 0);
}

/**
 * Validate coordinates (latitude/longitude)
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Calculate processing time remaining
 */
export function getProcessingTimeRemaining(submittedDate: Date, maxDays: number): string {
  const daysElapsed = daysBetween(new Date(), submittedDate);
  const daysRemaining = maxDays - daysElapsed;
  
  if (daysRemaining < 0) return 'Overdue';
  if (daysRemaining === 0) return 'Due today';
  if (daysRemaining === 1) return '1 day remaining';
  return `${daysRemaining} days remaining`;
}

/**
 * Export table data to CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  downloadFile(url, filename);
  window.URL.revokeObjectURL(url);
}
