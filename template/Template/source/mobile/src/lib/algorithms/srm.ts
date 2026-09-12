
// Spaced Repetition Model (SRM)
// Based on simplified SuperMemo-2

export const calculateNextReview = (attempts: number, success: boolean): Date => {
  const now = new Date();
  
  if (!success) {
     // Reset if failed
     return now; 
  }

  // Exponential backoff: 2^attempts days
  // attempts starts at 0? 1? TBD based on DB tracking.
  // Assuming attempts increments on every try.
  
  const daysToAdd = Math.pow(2, attempts);
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysToAdd);
  
  return nextDate;
};
