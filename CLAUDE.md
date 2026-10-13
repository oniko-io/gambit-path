# Gambit Path

Personal chess tutor PWA for one learner who started from zero and plays mostly on an Android phone.

## Where things stand

Live at https://oniko-io.github.io/gambit-path/ and installed on the learner's phone. Stage 1, openings, bot games with review, backup and the interface redesign are done. The learner plays in spare moments and reports back; the next planned work is Stage 2 in `docs/roadmap.md`. Ask how the bot difficulty and the look feel on the real phone before building more.

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
- The home screen leads with one next-step card. Keep it that way when adding sections.
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

## Interface

- All styling is in `src/index.css`, driven by the colour and radius variables at the top. No CSS framework, no web fonts (the app must work offline).
- Button roles: `primary` (filled, one per view, placed right or bottom for the thumb), `quiet` (grey secondary), `link` (text only), `small` for controls next to the board.
- Reuse `ScreenHeader` (back button, title, optional step segments), `Icon` (inline SVG), and the `card`, `rows`, `node`, `badge`, `pill`, `choices` classes before inventing new ones.
- Every lesson needs a badge in `src/lessons/icons.ts`. Chess symbols there carry U+FE0E so Android does not draw them as emoji.
- The board theme overrides chessground under `.board cg-board`. Hint arrows use the blue brush because green disappears on the green squares.

## Checking UI changes

There is no test suite. Changes so far were verified by driving the dev server with `puppeteer-core` and `/usr/bin/google-chrome-stable` at a 390x800 touch viewport, tapping squares by coordinate, and reading the screenshots. Unlock everything first by writing full progress into `localStorage`, or by opening a `#import=` link. With Stage 1 complete, "Play a game" is the hero card, not a row in the lesson list, and the lesson rows are folded behind "Review all 11 lessons".

## Known gaps

- Only one stage exists in code: `STAGE1` is used directly by `App.tsx`, `PathMap.tsx` and the content check. Stage 2 needs that generalised to a list of stages first.
- Pawn promotion always makes a queen; there is no picker.
- No automatic deploy on push: the GitHub login on this machine lacks the `workflow` scope. `npm run deploy` is the way.
- The learner once lost all progress by using an incognito tab. Stage 1 was restored with an import link; real star counts and game history from before are gone.
- Never tested on a real phone by the developer side; only the learner has used it there.
- The app is GPL-3.0 because Stockfish and chessground are. The repository is public for that reason.
