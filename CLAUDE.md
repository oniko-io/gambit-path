# Gambit Path

Personal chess tutor PWA for one learner who started from zero and plays mostly on an Android phone. The folder is named `chess`; the app and package are `gambit-path`.

## Commands

- `npm run dev -- --host`: dev server reachable from the phone on the same wifi
- `npm run build`: type-check and build
- `npm run lint`: oxlint
- `npm run check`: verify all lesson and opening data with chess.js. Run it after any content change.
- `npm run deploy`: publish to GitHub Pages at https://oniko-io.github.io/gambit-path/. Pushing to `main` does not deploy; this command does.

## Product rules

- Mobile first: portrait, tap-to-move, touch targets at least 48px.
- Short sessions, one obvious next step. Do not add menus or settings the learner has to think about.
- Explain why in plain language. The learner does not know chess jargon until a lesson has taught it.
- Local only: no backend, no account. State lives in `localStorage` under `gambit-path:progress` and `gambit-path:games`. Changing the shape of stored data must keep old saves loading.

## How it fits together

- `src/App.tsx` switches screens (path, lesson, opening, game setup, game) and owns saving.
- Two lesson level types, both in `src/lessons/stage1.ts`:
  - collect levels: one piece on a near-empty board, rules in `src/lib/moves.ts` (not chess.js, because these boards have no kings). "Best" move counts are computed by search, never typed in.
  - position levels: a real FEN, white to move, solved by one move that meets a goal (`src/lib/position.ts`).
- A lesson with `passStars` is a test: no hints, no retries, stored only as a whole run.
- `src/components/Board.tsx` wraps chessground. It forces the turn to the learner's colour on every update, because chessground flips it after each move.
- Bot: `src/lib/bot.ts`. Low levels mix random moves with Stockfish, since Stockfish at its weakest is still too strong for a beginner.
- The deployed app is served from `/gambit-path/`, so runtime URLs to public files must start with `import.meta.env.BASE_URL`.
- Backup: `src/lib/backup.ts` exports and imports all saved state as a code, and accepts it from a `#import=` link.
- Engine: `src/lib/engine.ts` runs `public/stockfish/` in a web worker, one search at a time.
- Blunder warnings: `src/lib/hazards.ts`, a rule check without the engine (mate in one, undefended piece, piece attacked by a cheaper one).
- Game review: `src/lib/analysis.ts` scores every position at depth 10 and explains the worst moves from templates.

## Checking UI changes

There is no test suite. Changes so far were verified by driving the dev server with `puppeteer-core` and `/usr/bin/google-chrome-stable` at a 390x800 touch viewport, tapping squares by coordinate, and reading the screenshots. Unlock everything first by writing full progress into `localStorage`.

## Known gaps

- Pawn promotion always makes a queen; there is no picker.
- Never tested on a real phone by the developer side; only the learner has used it there.
- The app is GPL-3.0 because Stockfish and chessground are. The repository is public for that reason.
