import { Complaint, Institution } from '../types';

/**
 * Generates an automatic, unique, institution-specific complaint ticket number.
 * Example: ATAP-CMP-2026-000004
 */
export function generateTicketNumber(institution: Institution, existingComplaints: Complaint[]): string {
  const year = new Date().getFullYear();
  const prefix = institution.ticketPrefix || `${institution.abbreviation.toUpperCase()}-CMP-${year}`;
  
  // Find highest sequence for this prefix
  const matching = existingComplaints.filter(c => c.ticketNumber.startsWith(prefix));
  let nextSeq = matching.length + 1;

  // Format to 6 digits (e.g. 000001)
  const padded = String(nextSeq).padStart(6, '0');
  let candidate = `${prefix}-${padded}`;

  // Ensure collision safety
  while (existingComplaints.some(c => c.ticketNumber === candidate)) {
    nextSeq++;
    candidate = `${prefix}-${String(nextSeq).padStart(6, '0')}`;
  }

  return candidate;
}

/**
 * Format relative or localized date/time
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
