# Adding content

All content is plain data. After any change run `npm run check`: it replays every level and line with the rules engine and reports anything illegal or unsolvable. Then `npm run deploy` to put it on the phone.

## A lesson

Lessons live in the `STAGE1` array in `src/lessons/stage1.ts`. Their order in the array is the unlock order.

```ts
{
  id: 'rook',            // also the key progress is saved under: never rename a shipped id
  title: 'The Rook',
  piece: 'rook',         // default piece for collect levels
  intro: ['One short sentence per line.', 'Shown before the first level.'],
  outro: 'Shown when the lesson is finished.',
  levels: [ /* see below */ ],
}
```

Adding `passStars: 24` turns a lesson into a test: no hints, no retries, passed once a single run earns that many stars.

Every lesson also needs a badge: add its `id` to `LESSON_ICON` in `src/lessons/icons.ts`. Use a chess piece symbol followed by `TEXT`, or a single notation sign such as `+` or `#`. Without it the badge is empty.

### Collect level

One white piece moves around; the learner collects stars or captures every black piece.

```ts
{
  piece: 'bishop',              // optional, overrides the lesson piece
  start: 'c1',
  stars: ['a3', 'f8'],          // leave empty to make the goal "capture every black piece"
  walls: ['d3'],                // own pawns: block, cannot be captured
  foes: { f4: 'pawn' },         // black pieces: never move, can be captured
  tip: 'Optional hint under the board.',
}
```

Rules to know:

- The best move count is computed, so there is nothing to type in. Three stars means matching it.
- A pawn that reaches the last row becomes a queen and keeps going.
- Black pieces never move or capture back. For anything that needs real rules, use a position level.

### Position level

A real position solved by one move.

```ts
{
  fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',  // must be white to move, both kings on the board
  goal: 'mate',
  lastMove: ['d7', 'd5'],   // optional: highlights black's previous move (needed for en passant)
  tip: 'Optional hint.',
}
```

| Goal | The move must |
|---|---|
| `any` | be legal. Use it for "get out of check" and build the position so only the intended escape exists |
| `check` | give check |
| `mate` | give checkmate |
| `castle` | be castling, either side |
| `enpassant` | be an en passant capture |

A wrong move shows a reason and rewinds. Stars count wrong tries: none is three stars, one is two.

## An opening

Openings live in the `OPENINGS` array in `src/openings/lines.ts`.

```ts
{
  id: 'italian',
  title: 'Italian Game',
  side: 'white',         // the side the learner plays; the other side is played automatically
  idea: 'One or two sentences on what this opening is for.',
  moves: [
    { san: 'e4', note: 'Why this move.' },
    { san: 'e5', note: 'Why the reply.' },
  ],
}
```

- `moves` is the whole line from move one, white and black alternating.
- Write moves exactly as chess.js prints them: `Nbd2` when two knights could go there, `Qxf7#` for mate, `O-O` for castling. The check tells you the right spelling if it differs.
- Every note is shown to the learner, for both sides. Say what the move does in plain words.
- Keep lines to about 6 to 8 moves per side. Longer lines are hard to recall from memory.
