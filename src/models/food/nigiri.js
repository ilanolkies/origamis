import { cm, HALF_SHEET, HALF_SHEET_CM, LONG, SHORT } from '../shapes.js'

const MIDDLE = SHORT / 2
const END = 0.55
const ROUND = 0.06
const EDGE = 0.2
const FISH = SHORT - EDGE
const CORNER = 0.1
const SEAT = 0.02

const corners = (x, y, k, kind) =>
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => ({
    from: [sx * (x - k), sy * y],
    to: [sx * x, sy * (y - k)],
    mover: [sx * x, sy * y],
    kind,
    bend: sx * sy,
  }))

const stripes = [-0.45, -0.2, 0.05, 0.3].map(x => [[x, -0.11], [x + 0.1, 0.11]])

export const nigiri = {
  id: 'nigiri',
  name: 'Nigiri',
  kana: 'にぎりずし',
  sheet: HALF_SHEET,
  paper: `${HALF_SHEET_CM} paper`,
  parts: [
    {
      id: 'rice',
      name: 'Rice',
      kanji: 'シャリ',
      tone: 'rice',
      paper: `${HALF_SHEET_CM} rectangle, white on one side`,
      steps: [
        {
          text: 'White side up, a long edge toward you. Fold the top and bottom edges in to the centre line.',
          actions: [
            { from: [-1, MIDDLE], to: [1, MIDDLE], mover: [0, SHORT], kind: 'valley', bend: -1 },
            { from: [-1, -MIDDLE], to: [1, -MIDDLE], mover: [0, -SHORT], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: `Fold the ends behind along upright creases ${cm(LONG - END)} cm in.`,
          actions: [
            { from: [-END, 0], to: [-END, 1], mover: [-LONG, 0], kind: 'mountain', bend: 1 },
            { from: [END, 0], to: [END, 1], mover: [LONG, 0], kind: 'mountain', bend: -1 },
          ],
        },
        {
          text: 'Fold the four corners behind a little to round the rice.',
          actions: corners(END, MIDDLE, ROUND, 'mountain'),
        },
      ],
    },
    {
      id: 'fish',
      name: 'Fish',
      kanji: 'ネタ',
      tone: 'salmon',
      paper: `${HALF_SHEET_CM} rectangle, orange on one side`,
      steps: [
        {
          text: `New sheet, white side up, a long edge toward you. Fold the top and bottom edges in by ${cm(EDGE)} cm.`,
          actions: [
            { from: [-1, SHORT - EDGE], to: [1, SHORT - EDGE], mover: [0, SHORT], kind: 'valley', bend: -1 },
            { from: [-1, EDGE - SHORT], to: [1, EDGE - SHORT], mover: [0, -SHORT], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: `Fold the four corners in, ${cm(CORNER)} cm along each edge.`,
          actions: corners(LONG, FISH, CORNER, 'valley'),
        },
        {
          text: 'Turn the paper over.',
          actions: [{ kind: 'turn' }],
        },
        {
          text: 'Draw the stripes of the fish.',
          actions: [{ kind: 'draw', strokes: stripes }],
        },
      ],
    },
  ],
  finish: {
    name: 'Finish',
    kanji: '完成',
    base: 'rice',
    top: 'fish',
    seat: [0, FISH + SEAT],
    text: 'Lay the fish over the top half of the rice, so the rice shows below it. A dab of glue keeps it in place.',
  },
}
