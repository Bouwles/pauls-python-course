// The review deck, scheduled with FSRS.
//
// One scheduling card per concept (review_cards.cardId is the concept id).
// Each review shows one of the concept's variants, preferring the one seen
// least recently, so the learner can't memorise a single answer.
import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card as FsrsCard, type Grade } from "ts-fsrs";
import type { LocalStore } from "../store/local";
import type { ReviewCardRow, ReviewLogRow, SelfRating } from "../store/types";

const scheduler = fsrs(generatorParameters({ enable_fuzz: true, request_retention: 0.9, maximum_interval: 365 }));

const HOUR = 3600_000;
/** New concepts come up for review the next day, not straight away. */
const FIRST_REVIEW_AFTER = 18 * HOUR;

export { Rating };

function toFsrs(row: ReviewCardRow): FsrsCard {
  return {
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsedDays,
    scheduled_days: row.scheduledDays,
    learning_steps: row.learningSteps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as State,
    last_review: row.lastReview ? new Date(row.lastReview) : undefined,
  };
}

function fromFsrs(conceptId: string, card: FsrsCard): ReviewCardRow {
  return {
    key: conceptId,
    cardId: conceptId,
    conceptId,
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.last_review ? card.last_review.getTime() : null,
    updatedAt: Date.now(),
  };
}

export function newCardRow(conceptId: string, now = Date.now()): ReviewCardRow {
  const card = createEmptyCard(new Date(now));
  card.due = new Date(now + FIRST_REVIEW_AFTER);
  return fromFsrs(conceptId, card);
}

/** Add each concept to the deck if it isn't there yet. Returns the ones added. */
export async function addCardsForJob(store: LocalStore, conceptIds: string[]): Promise<string[]> {
  const added: string[] = [];
  const now = Date.now();
  for (const id of conceptIds) {
    if (await store.get("review_cards", id)) continue;
    await store.put("review_cards", newCardRow(id, now));
    added.push(id);
  }
  return added;
}

export async function dueCards(store: LocalStore, now = Date.now()): Promise<ReviewCardRow[]> {
  const all = await store.all("review_cards");
  return all.filter((c) => c.due <= now).sort((a, b) => a.due - b.due);
}

export async function nextDueAt(store: LocalStore): Promise<number | null> {
  const all = await store.all("review_cards");
  return all.length ? Math.min(...all.map((c) => c.due)) : null;
}

/** Record a review and reschedule the concept. */
export async function review(store: LocalStore, conceptId: string, variantId: string, grade: Grade, now = Date.now()): Promise<ReviewCardRow> {
  const row = (await store.get("review_cards", conceptId)) ?? newCardRow(conceptId, now);
  const { card, log } = scheduler.next(toFsrs(row), new Date(now), grade);
  const next = fromFsrs(conceptId, card);
  await store.put("review_cards", next);
  const entry: ReviewLogRow = {
    key: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    cardId: variantId,
    rating: grade,
    reviewedAt: now,
    elapsedDays: log.elapsed_days,
    scheduledDays: log.scheduled_days,
    updatedAt: now,
  };
  await store.put("review_logs", entry);
  return next;
}

/** Pick the variant of a concept seen least recently (never seen first). */
export async function pickVariant(store: LocalStore, conceptId: string, variantIds: string[]): Promise<string> {
  const logs = (await store.all("review_logs")).filter((l) => variantIds.includes(l.cardId));
  const lastSeen = new Map<string, number>();
  for (const l of logs) lastSeen.set(l.cardId, Math.max(lastSeen.get(l.cardId) ?? 0, l.reviewedAt));
  const sorted = [...variantIds].sort((a, b) => (lastSeen.get(a) ?? 0) - (lastSeen.get(b) ?? 0));
  const unseen = sorted.filter((v) => !lastSeen.has(v));
  const pool = unseen.length ? unseen : sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
  return pool[Math.floor(Math.random() * pool.length)] ?? variantIds[0]!;
}

/** "Seen solution": bring the concept forward so a fresh variant comes up soon. */
export async function queueSoon(store: LocalStore, conceptIds: string[], inHours = 4): Promise<void> {
  const now = Date.now();
  for (const id of conceptIds) {
    const row = (await store.get("review_cards", id)) ?? newCardRow(id, now);
    await store.put("review_cards", { ...row, due: Math.min(row.due, now + inHours * HOUR), updatedAt: now });
  }
}

/** Self-explanation ratings feed the schedule. */
export async function applySelfRating(store: LocalStore, conceptId: string, rating: SelfRating): Promise<void> {
  const existing = await store.get("review_cards", conceptId);
  if (!existing) {
    const row = newCardRow(conceptId);
    if (rating === "missed") row.due = Date.now() + 4 * HOUR;
    await store.put("review_cards", row);
    return;
  }
  if (rating === "missed") await queueSoon(store, [conceptId]);
}

/** Map an answer to an FSRS grade. */
export function gradeFor(correct: boolean, attempts: number): Grade {
  if (!correct) return Rating.Again;
  return attempts > 1 ? Rating.Hard : Rating.Good;
}
