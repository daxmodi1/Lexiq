/**
 * Mastery Score System
 * Per PRD section 3.2: Score ranges 0-100, starts at 50
 */

export type MasteryEvent =
  | 'correct_first'    // +8
  | 'correct_second'   // +4
  | 'wrong'            // -10
  | 'skipped'          // -3
  | 'streak_bonus';    // +5

const SCORE_DELTAS: Record<MasteryEvent, number> = {
  correct_first: 8,
  correct_second: 4,
  wrong: -10,
  skipped: -3,
  streak_bonus: 5,
};

/**
 * Calculate new mastery score after an event
 * Score is always clamped between 0 and 100
 */
export function calculateMastery(currentScore: number, event: MasteryEvent): number {
  const delta = SCORE_DELTAS[event];
  return Math.max(0, Math.min(100, currentScore + delta));
}

/**
 * Calculate mastery score with optional streak bonus
 */
export function calculateMasteryWithStreak(
  currentScore: number,
  event: MasteryEvent,
  consecutiveCorrect: number
): number {
  let newScore = calculateMastery(currentScore, event);
  
  // Apply streak bonus at 5 consecutive correct
  if (consecutiveCorrect > 0 && consecutiveCorrect % 5 === 0 && event.startsWith('correct')) {
    newScore = Math.min(100, newScore + SCORE_DELTAS.streak_bonus);
  }
  
  return newScore;
}

/**
 * Check if a word should be in the review queue
 * Condition: not reviewed in 30+ days
 */
export function shouldBeInReviewQueue(lastReviewedAt: string | null): boolean {
  if (!lastReviewedAt) return false;
  
  const lastReview = new Date(lastReviewedAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return lastReview < thirtyDaysAgo;
}
