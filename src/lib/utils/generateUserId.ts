/**
 * Generate unique user ID in format: NES + YYMMDD + random 3 chars
 * Example: NES250215A7B
 * 
 * NES = Niyat-e-Shaukh prefix
 * 250215 = February 15, 2025
 * A7B = Random alphanumeric characters
 */
export function generateUserId(eventDate: Date): string {
  // Format date as YYMMDD
  const year = eventDate.getFullYear().toString().slice(-2);
  const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
  const day = eventDate.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate 3 random alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 3; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `NES${dateStr}${randomStr}`;
}

/**
 * Validate user ID format
 */
export function isValidUserId(userId: string): boolean {
  // Format: NES + 6 digits + 3 alphanumeric
  const pattern = /^NES\d{6}[A-Z0-9]{3}$/;
  return pattern.test(userId);
}