import type { Lesson } from '../lessons/stage1.ts'

const STORAGE_KEY = 'gambit-path:progress'

/** Best rating (1-3) per level, keyed by lesson id. 0 or missing = not cleared. */
export type Progress = Record<string, number[]>

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // storage unavailable (private mode): progress lasts for this visit only
  }
}

export function withRating(progress: Progress, lessonId: string, level: number, rating: number): Progress {
  const ratings = [...(progress[lessonId] ?? [])]
  ratings[level] = Math.max(ratings[level] ?? 0, rating)
  return { ...progress, [lessonId]: ratings }
}

export function lessonStars(progress: Progress, lessonId: string): number {
  return (progress[lessonId] ?? []).reduce((sum, r) => sum + (r ?? 0), 0)
}

/** Keeps a whole test run, but only if it beats the stored one. */
export function withTestRun(progress: Progress, lessonId: string, ratings: number[]): Progress {
  const total = ratings.reduce((sum, r) => sum + r, 0)
  return total > lessonStars(progress, lessonId) ? { ...progress, [lessonId]: ratings } : progress
}

export function isLessonDone(progress: Progress, lesson: Lesson): boolean {
  if (lesson.passStars) return lessonStars(progress, lesson.id) >= lesson.passStars
  const ratings = progress[lesson.id] ?? []
  return lesson.levels.every((_, i) => ratings[i] > 0)
}
