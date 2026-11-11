import { cm, DIAMOND, HALVE_DOWN, SIDE_CM } from '../shapes.js'

const KEEL = -0.5
const MAST = 0.35
const DEPTH = 0.2

export const sailboat = {
  id: 'sailboat',
  name: 'Sailboat',
  kana: 'ヨット',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'sail',
      name: 'Sail',
      kanji: '帆',
      tone: 'sail',
      paper: `${SIDE_CM} cm square, red on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the left corner over to the right corner.',
          actions: [{ from: [0, -1], to: [0, 1], mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
      ],
    },
    {
      id: 'hull',
      name: 'Hull',
      kanji: '船体',
      tone: 'wood',
      paper: `${SIDE_CM} cm square, brown on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the top corner down to the bottom corner.',
          actions: [HALVE_DOWN],
        },
        {
          text: `Fold the bottom point behind, ${cm(1 + KEEL)} cm up from the tip.`,
          actions: [{ from: [-1, KEEL], to: [1, KEEL], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
      ],
    },
  ],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'sail' },
    steps: [
      {
        text: `Glue the hull over the bottom ${cm(DEPTH)} cm of the sail, with the sail's fold standing upright a little left of the middle.`,
        actions: [{ kind: 'join', part: 'hull', seat: [MAST, DEPTH - 1] }],
      },
    ],
  },
}
