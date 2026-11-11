import { cm, DIAMOND, SIDE_CM } from '../shapes.js'

const RIND = 0.15
const SIDE = 0.85
const BOTTOM = -0.85

const seed = ([x, y]) => [[x, y + 0.04], [x - 0.022, y - 0.005], [x, y - 0.03], [x + 0.022, y - 0.005], [x, y + 0.04]]

const seeds = [
  [-0.45, -0.02],
  [0, -0.04],
  [0.45, -0.02],
  [-0.22, -0.28],
  [0.22, -0.28],
  [0, -0.48],
].map(seed)

export const watermelon = {
  id: 'watermelon',
  name: 'Watermelon',
  kana: 'すいか',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'slice',
      name: 'Slice',
      kanji: '西瓜',
      tone: 'melon',
      paper: `${SIDE_CM} cm square, red on one side`,
      steps: [
        {
          text: `White side up, a corner toward you. Fold the top corner down, stopping ${cm(2 * RIND)} cm short of the bottom corner. The white border is the rind.`,
          actions: [{ from: [-1, RIND], to: [1, RIND], mover: [0, 1], kind: 'valley', bend: -1 }],
        },
        {
          text: `Fold the side corners behind along upright creases ${cm(1 - SIDE)} cm in from the tips.`,
          actions: [
            { from: [-SIDE, 0], to: [-SIDE, 1], mover: [-1, 0], kind: 'mountain', bend: 1 },
            { from: [SIDE, 0], to: [SIDE, 1], mover: [1, 0], kind: 'mountain', bend: -1 },
          ],
        },
        {
          text: `Fold the bottom tip behind, ${cm(1 + BOTTOM)} cm up from the point.`,
          actions: [{ from: [-1, BOTTOM], to: [1, BOTTOM], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: 'Draw the seeds.',
          actions: [{ kind: 'draw', strokes: seeds }],
        },
      ],
    },
  ],
}
