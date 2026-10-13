export interface OpeningMove {
  san: string
  note: string
}

export interface Opening {
  id: string
  title: string
  /** The side the learner plays. The other side's moves are played automatically. */
  side: 'white' | 'black'
  idea: string
  /** Full line from move one, white and black alternating. */
  moves: OpeningMove[]
}

export const PRINCIPLES = [
  'Put a pawn or two in the centre.',
  'Bring out knights and bishops before the queen and rooks.',
  'Castle early to hide the king.',
  'Do not move the same piece twice without a reason.',
]

export const OPENINGS: Opening[] = [
  {
    id: 'italian',
    title: 'Italian Game',
    side: 'white',
    idea: 'The classic way to start: centre pawn, knight, bishop, castle. Every move follows the basic principles.',
    moves: [
      { san: 'e4', note: 'A pawn in the centre. It also opens lines for your queen and bishop.' },
      { san: 'e5', note: 'Black claims a share of the centre too.' },
      { san: 'Nf3', note: 'Develop a knight and attack the e5 pawn at the same time.' },
      { san: 'Nc6', note: 'Black defends the pawn while developing.' },
      { san: 'Bc4', note: 'The bishop aims at f7, the weakest square next to the black king.' },
      { san: 'Bc5', note: 'Black puts a bishop on the same strong diagonal.' },
      { san: 'c3', note: 'Prepares d4 later, to build a wide pawn centre.' },
      { san: 'Nf6', note: 'Black develops and attacks your e4 pawn.' },
      { san: 'd3', note: 'Protects e4 solidly and frees your other bishop.' },
      { san: 'd6', note: 'Black supports e5 and frees a bishop as well.' },
      { san: 'O-O', note: 'King to safety, rook toward the centre. Your opening is complete.' },
      { san: 'O-O', note: 'Black castles too. Now the real game begins.' },
    ],
  },
  {
    id: 'london',
    title: 'London System',
    side: 'white',
    idea: 'One setup you can play against almost anything black does. Little to memorise, very solid.',
    moves: [
      { san: 'd4', note: 'A centre pawn that the queen already protects.' },
      { san: 'd5', note: 'Black takes centre space.' },
      { san: 'Bf4', note: 'The signature move: the bishop comes out before e3 would lock it in.' },
      { san: 'Nf6', note: 'Black develops.' },
      { san: 'e3', note: 'Supports d4 and opens the other bishop.' },
      { san: 'e6', note: 'Black does the same.' },
      { san: 'Nf3', note: 'The knight goes to its natural square and watches e5.' },
      { san: 'Bd6', note: 'Black offers to trade bishops.' },
      { san: 'Bg3', note: 'Step back. If black takes, your h-pawn recaptures and opens a file for the rook.' },
      { san: 'O-O', note: 'Black castles.' },
      { san: 'Bd3', note: "The second bishop points at black's castled king." },
      { san: 'c5', note: 'Black attacks your centre.' },
      { san: 'c3', note: 'The pawn triangle c3, d4, e3. Very hard to break.' },
      { san: 'Nc6', note: 'Black adds pressure on d4.' },
      { san: 'Nbd2', note: 'The last minor piece is out. Castle next and you have the full London setup.' },
    ],
  },
  {
    id: 'queens-gambit',
    title: "Queen's Gambit",
    side: 'white',
    idea: 'Offer a side pawn to pull black away from the centre. It is not a real sacrifice: you usually win the pawn back.',
    moves: [
      { san: 'd4', note: 'A centre pawn that the queen already protects.' },
      { san: 'd5', note: 'Black takes centre space.' },
      { san: 'c4', note: "The gambit: attack d5 from the side. If black takes, black's centre pawn is gone." },
      { san: 'e6', note: 'Black declines and supports d5.' },
      { san: 'Nc3', note: 'A second attacker on d5.' },
      { san: 'Nf6', note: 'A second defender for d5.' },
      { san: 'Bg5', note: 'Pins the knight to the queen behind it, so it defends d5 less well.' },
      { san: 'Be7', note: 'Black breaks the pin.' },
      { san: 'e3', note: 'Opens the bishop and protects the c4 pawn.' },
      { san: 'O-O', note: 'Black castles.' },
      { san: 'Nf3', note: 'Everything is developed. Bring the bishop out and castle next.' },
    ],
  },
  {
    id: 'scholars-mate',
    title: "Scholar's Mate",
    side: 'white',
    idea: 'A four-move checkmate that catches beginners. Learn the pattern, mostly so it never happens to you. Against good defence the early queen is a mistake.',
    moves: [
      { san: 'e4', note: 'Opens lines for the queen and bishop.' },
      { san: 'e5', note: 'Black claims the centre.' },
      { san: 'Bc4', note: 'The bishop aims at f7, guarded only by the king.' },
      { san: 'Nc6', note: 'Black develops.' },
      { san: 'Qh5', note: 'Now two pieces attack f7. The threat is Qxf7, checkmate.' },
      { san: 'Nf6', note: 'It attacks your queen, but ignores the threat. A losing mistake.' },
      { san: 'Qxf7#', note: 'Checkmate. The bishop guards the queen, so the king cannot take her.' },
    ],
  },
  {
    id: 'stop-scholars-mate',
    title: "Stopping Scholar's Mate",
    side: 'black',
    idea: 'White brings the queen out early and hunts f7. Defend calmly and you come out ahead.',
    moves: [
      { san: 'e4', note: 'White opens with the king pawn.' },
      { san: 'e5', note: 'Take your share of the centre.' },
      { san: 'Qh5', note: 'The queen comes out early. She attacks e5 and eyes f7.' },
      { san: 'Nc6', note: 'Defend e5 first, with a developing move.' },
      { san: 'Bc4', note: 'Now the threat is Qxf7, checkmate.' },
      { san: 'g6', note: "Blocks the queen's path to f7 and attacks her." },
      { san: 'Qf3', note: 'White threatens mate on f7 once more.' },
      { san: 'Nf6', note: 'Blocked again, by a developing move. The attack is over and you have more pieces out.' },
    ],
  },
  {
    id: 'caro-kann',
    title: 'Caro-Kann Defence',
    side: 'black',
    idea: 'A solid answer to e4. Build a pawn chain, get the light bishop out early, give white nothing to attack.',
    moves: [
      { san: 'e4', note: 'White opens with the king pawn.' },
      { san: 'c6', note: 'Prepares d5 with a pawn behind it.' },
      { san: 'd4', note: 'White takes the whole centre.' },
      { san: 'd5', note: "Challenge e4 at once. If white takes, your c-pawn takes back and you keep a centre pawn." },
      { san: 'Nc3', note: 'White defends e4.' },
      { san: 'dxe4', note: 'Trade the centre pawns.' },
      { san: 'Nxe4', note: 'White recaptures with the knight.' },
      { san: 'Bf5', note: 'The point of the opening: the bishop gets out before e6 locks it in, and it attacks the knight.' },
      { san: 'Ng3', note: 'The knight steps away and attacks your bishop.' },
      { san: 'Bg6', note: 'Step back and keep the bishop on its good diagonal.' },
      { san: 'Nf3', note: 'White develops.' },
      { san: 'Nd7', note: "Guards e5 so white's knight cannot jump in. Your other knight goes to f6 next." },
    ],
  },
  {
    id: 'qgd',
    title: "Queen's Gambit Declined",
    side: 'black',
    idea: 'The reliable answer to d4 and c4: hold the centre with pawns, develop, castle.',
    moves: [
      { san: 'd4', note: 'White opens with the queen pawn.' },
      { san: 'd5', note: 'Take your share of the centre.' },
      { san: 'c4', note: 'White offers a pawn to pull yours away from the centre.' },
      { san: 'e6', note: 'Decline. Keep the pawn on d5 and support it.' },
      { san: 'Nc3', note: 'A second attacker on d5.' },
      { san: 'Nf6', note: 'A second defender.' },
      { san: 'Bg5', note: 'White pins your knight to your queen.' },
      { san: 'Be7', note: 'Break the pin. Now the knight is free again.' },
      { san: 'e3', note: 'White opens the bishop.' },
      { san: 'O-O', note: 'King safe.' },
      { san: 'Nf3', note: 'White finishes developing.' },
      { san: 'Nbd7', note: 'Support the f6 knight. A solid position with no weaknesses.' },
    ],
  },
]
