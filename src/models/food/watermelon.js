import { cm, HALF_SHEET, HALF_SHEET_CM, LONG, SHORT } from '../shapes.js'

const RIND = 0.1
const BASE = RIND - SHORT

const seed = ([x, y]) => [[x, y + 0.04], [x - 0.022, y - 0.005], [x, y - 0.03], [x + 0.022, y - 0.005], [x, y + 0.04]]

const seeds = [
  [-0.3, -0.07],
  [0, -0.07],
  [0.3, -0.07],
  [-0.15, 0.06],
  [0.15, 0.06],
  [0, 0.18],
].map(seed)

export const watermelon = {
  id: 'watermelon',
  name: 'Watermelon',
  kana: 'すいか',
  sheet: HALF_SHEET,
  paper: `${HALF_SHEET_CM} paper`,
  parts: [
    {
      id: 'slice',
      name: 'Slice',
      kanji: '西瓜',
      tone: 'melon',
      back: 'rind',
      paper: `${HALF_SHEET_CM} rectangle, red on one side, green on the other`,
      steps: [
        {
          text: `Green side up, a long edge toward you. Fold the bottom edge behind by ${cm(RIND)} cm.`,
          actions: [{ from: [-1, BASE], to: [1, BASE], mover: [0, -SHORT], kind: 'mountain', bend: 1 }],
        },
        {
          text: 'Turn the paper over. The green strip along the bottom is the rind.',
          actions: [{ kind: 'turn' }],
        },
        {
          text: `Fold the top corners behind along creases from ${cm(RIND)} cm either side of the middle of the top edge to the ends of the rind.`,
          actions: [
            { from: [-RIND, SHORT], to: [-LONG, BASE], mover: [-LONG, SHORT], kind: 'mountain', bend: 1 },
            { from: [RIND, SHORT], to: [LONG, BASE], mover: [LONG, SHORT], kind: 'mountain', bend: -1 },
          ],
        },
        {
          text: 'Draw the seeds.',
          actions: [{ kind: 'draw', strokes: seeds }],
        },
      ],
    },
  ],
}
