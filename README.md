# Gambit Path

A personal chess tutor: one path from not knowing the rules to playing well. It runs in the browser, is built for a phone, and keeps all progress on the device.

**Play it: https://oniko-io.github.io/gambit-path/** (on Android: Chrome menu → Add to Home screen)

## Run it

```sh
npm install
npm run dev -- --host   # then open the "Network" URL on a phone on the same wifi
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built app |
| `npm run lint` | Lint with oxlint |
| `npm run check` | Verify every lesson level and opening line with the rules engine |
| `npm run deploy` | Check, build and publish to GitHub Pages (the `gh-pages` branch) |

Installing the app to a phone home screen needs HTTPS, so it only works from the deployed copy, not from the wifi URL.

After a deploy, the installed app picks up the new version the next time it is opened online; it shows after one more restart.

Progress is stored in the browser, separately for each web address. "Backup and transfer" at the bottom of the home screen moves it between addresses and devices. A private or incognito tab deletes it when the tab closes.

## What is in it

- **Stage 1, Pieces**: 10 lessons (how each piece moves, capturing, check, checkmate, castling, en passant) and a stage test.
- **Openings**: 7 guided lines, learned with arrows first and then played from memory.
- **Games against a bot**: choose side and difficulty, optional blunder warnings, captured pieces shown, and a review after each game with the worst moves and a better move for each.
- **Backup and transfer**: move progress between devices with a link or a code.

The home screen always leads with one next step: the next lesson, or a game once Stage 1 is done.

Planned work is in [docs/roadmap.md](docs/roadmap.md). How to add lessons and openings is in [docs/adding-content.md](docs/adding-content.md).

## Layout

```
src/
  App.tsx            screen switching and saving
  components/        screens and the board wrapper
  index.css          the whole visual system: colours, buttons, cards, board theme
  lessons/stage1.ts  lesson and test data
  lessons/icons.ts   the badge shown next to each lesson
  openings/lines.ts  opening data
  lib/               move rules for lessons, bot, engine, game review, storage, backup
public/stockfish/    the chess engine (copied from the stockfish npm package)
scripts/             content check and deploy
docs/                roadmap and how to add content
```

## Built with

Vite, React, TypeScript, [chessground](https://github.com/lichess-org/chessground) for the board, [chess.js](https://github.com/jhlywa/chess.js) for the rules, [Stockfish](https://github.com/nmrugg/stockfish.js) for the bot and the review.

Stockfish and chessground are licensed under GPL-3.0, so this app is too: see [LICENSE](LICENSE).
