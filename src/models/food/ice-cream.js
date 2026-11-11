import { add, polar } from '../../geometry.js'
import { CM, cm, DIAMOND, SIDE_CM } from '../shapes.js'

const BOTTOM = [0, -1]
const RIM = Math.SQRT2 - 1
const FLAT = -0.35
const SIDE = 0.7
const TOP = 0.6
const OVERLAP = 0.15

const waffle = [
  [[-0.38, 0.3], [0.08, -0.48]],
  [[-0.08, 0.3], [0.2, -0.18]],
  [[0.38, 0.3], [-0.08, -0.48]],
  [[0.08, 0.3], [-0.2, -0.18]],
]

export const iceCream = {
  id: 'ice-cream',
  name: 'Ice cream',
  kana: 'アイスクリーム',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'scoop',
      name: 'Scoop',
      kanji: '玉',
      tone: 'cream',
      paper: `${SIDE_CM} cm square, pink on one side`,
      steps: [
        {
          text: `White side up, a corner toward you. Fold the bottom corner up along a crease ${cm(1 + FLAT)} cm above it.`,
          actions: [{ from: [-1, FLAT], to: [1, FLAT], mover: [0, -1], kind: 'valley', bend: 1 }],
        },
        {
          text: `Fold the side corners in along upright creases ${cm(1 - SIDE)} cm from the tips.`,
          actions: [
            { from: [-SIDE, 0], to: [-SIDE, 1], mover: [-1, 0], kind: 'valley', bend: -1 },
            { from: [SIDE, 0], to: [SIDE, 1], mover: [1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: `Fold the top corner down, ${cm(1 - TOP)} cm from the tip.`,
          actions: [{ from: [-1, TOP], to: [1, TOP], mover: [0, 1], kind: 'valley', bend: -1 }],
        },
        {
          text: 'Turn the paper over: a round pink scoop.',
          actions: [{ kind: 'turn' }],
        },
      ],
    },
    {
      id: 'cone',
      name: 'Cone',
      kanji: 'コーン',
      tone: 'cone',
      paper: `${SIDE_CM} cm square, light brown on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the two lower edges in to the centre line.',
          actions: [
            { from: BOTTOM, to: add(BOTTOM, polar(67.5)), mover: [1, 0], kind: 'valley', bend: -1 },
            { from: BOTTOM, to: add(BOTTOM, polar(112.5)), mover: [-1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: 'Fold the white top behind along the top edges of the flaps.',
          actions: [{ from: [-1, RIM], to: [1, RIM], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: 'Draw a criss-cross waffle pattern on the cone.',
          actions: [{ kind: 'draw', strokes: waffle }],
        },
      ],
    },
  ],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'scoop' },
    steps: [
      {
        text: `Lay the cone over the bottom of the scoop so about ${Math.round(OVERLAP * CM)} cm of the scoop tucks behind it. A dab of glue keeps it in place.`,
        actions: [{ kind: 'join', part: 'cone', seat: [0, FLAT + OVERLAP - RIM] }],
      },
    ],
  },
}
