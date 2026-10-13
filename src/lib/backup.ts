import { loadGameStats, saveGameStats, type GameStats } from './games.ts'
import { loadProgress, saveProgress, type Progress } from './progress.ts'

/** Where the deployed app lives. Progress is stored per address, so it has to be carried over. */
export const PUBLIC_URL = 'https://oniko-io.github.io/gambit-path/'

const HASH_PREFIX = '#import='

interface Backup {
  v: 1
  progress: Progress
  games: GameStats
}

/** Everything saved on this device, as one line of text. */
export function exportCode(): string {
  const backup: Backup = { v: 1, progress: loadProgress(), games: loadGameStats() }
  return btoa(JSON.stringify(backup))
}

/** Link that opens the deployed app and hands it this device's progress. */
export const transferLink = () => `${PUBLIC_URL}${HASH_PREFIX}${encodeURIComponent(exportCode())}`

function parse(code: string): Backup | null {
  try {
    const data = JSON.parse(atob(code.trim()))
    const ratingsOk =
      data?.v === 1 &&
      typeof data.progress === 'object' &&
      data.progress !== null &&
      Object.values(data.progress).every((r) => Array.isArray(r) && r.every((n) => n == null || typeof n === 'number'))
    return ratingsOk && typeof data.games === 'object' && data.games !== null ? data : null
  } catch {
    return null
  }
}

/** Replaces this device's progress with the one in `code`. False if the code is not valid. */
export function importCode(code: string): boolean {
  const backup = parse(code)
  if (!backup) return false
  saveProgress(backup.progress)
  saveGameStats(backup.games)
  return true
}

/** Handles a transfer link. Call before the app reads its saved state. */
export function importFromHash() {
  if (!location.hash.startsWith(HASH_PREFIX)) return
  const code = decodeURIComponent(location.hash.slice(HASH_PREFIX.length))
  history.replaceState(null, '', location.pathname + location.search)
  if (!parse(code)) return
  const hasProgress = Object.keys(loadProgress()).length > 0
  if (hasProgress && !confirm('Replace the progress on this device with the transferred progress?')) return
  importCode(code)
}
