export type Sm2Quality = 1 | 3 | 4 | 5;

export interface Sm2CardState {
  intervalDays: number;
  ease: number;
  repetitions: number;
}

export interface Sm2ReviewResult extends Sm2CardState {
  dueAt: string;
}

/** SM-2 with 4 UI grades: Again=1, Hard=3, Good=4, Easy=5. No 30-day cap. */
export function reviewSm2(
  card: Sm2CardState,
  quality: Sm2Quality,
  now = Date.now()
): Sm2ReviewResult {
  let intervalDays = Math.max(1, card.intervalDays || 1);
  let ease = Number.isFinite(card.ease) ? Number(card.ease) : 2.5;
  let repetitions = Math.max(0, card.repetitions || 0);

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round(intervalDays * ease));
    repetitions += 1;
    if (quality === 3) {
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
    } else if (quality === 5) {
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * 1.3));
    }
  }

  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  return {
    intervalDays,
    ease: Math.round(ease * 100) / 100,
    repetitions,
    dueAt: new Date(now + intervalDays * 86400000).toISOString(),
  };
}
