import { add, polar } from '../../geometry.js'
import { DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TIP = 0.12

const blunt = (corner, inward, bend) => {
  const from = add(corner, polar(inward, TIP))
  return { from, to: add(from, polar(inward + 90)), mover: corner, kind: 'mountain', bend }
}
const TIERS = [
  { scale: 1, seat: [0, 0] },
  { scale: 0.8, seat: [0, 0.45] },
  { scale: 0.6, seat: [0, 0.9] },
]
const TRUNK = 0.6
const SIZES = TIERS.map(tier => Math.round(tier.scale * SIDE_CM))
const PEAK = TIERS.at(-1).seat[1] + TIERS.at(-1).scale
const STAR = add([0, PEAK], [0, 0.04])

const star = [
  Array.from({ length: 11 }, (_, i) => add(STAR, polar(90 + i * 144, 0.13))),
]
const baubles = [[-0.5, 0.15], [0.45, 0.25], [-0.3, 0.62], [0.32, 0.75], [-0.1, 1.1]].map(spot =>
  Array.from({ length: 9 }, (_, i) => add(spot, polar(i * 45, 0.035))),
)

export const christmasTree = {
  id: 'christmas-tree',
  name: 'Christmas tree',
  kana: 'クリスマスツリー',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  paper: `${SIZES.join(', ')} and ${Math.round(TRUNK * SIDE_CM)} cm paper`,
  parts: [
    {
      id: 'tier',
      name: 'Tier',
      kanji: '枝',
      tone: 'pine',
      copies: TIERS.length,
      paper: `${SIZES.slice(0, -1).join(', ')} and ${SIZES.at(-1)} cm squares, green on one side`,
      steps: [
        {
          text: 'Fold each of the three squares the same way. White side up, a corner toward you. Fold the bottom corner up to the top corner.',
          actions: [HALVE_UP],
        },
        {
          text: 'Fold the two side tips behind a little to blunt them.',
          actions: [blunt([1, 0], 157.5, 1), blunt([-1, 0], 22.5, -1)],
        },
      ],
    },
    {
      id: 'trunk',
      name: 'Trunk',
      kanji: '幹',
      tone: 'wood',
      paper: `${Math.round(TRUNK * SIDE_CM)} cm square, brown on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the side corners in to the centre.',
          actions: [
            { from: [-0.5, -1], to: [-0.5, 1], mover: [-1, 0], kind: 'valley', bend: 1 },
            { from: [0.5, -1], to: [0.5, 1], mover: [1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: 'Fold the top and bottom corners in to the centre too: a small square.',
          actions: [
            { from: [-1, 0.5], to: [1, 0.5], mover: [0, 1], kind: 'valley', bend: -1 },
            { from: [-1, -0.5], to: [1, -0.5], mover: [0, -1], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: 'Fold the left and right edges in to the middle: a narrow trunk.',
          actions: [
            { from: [-0.25, -1], to: [-0.25, 1], mover: [-0.5, 0], kind: 'valley', bend: 1 },
            { from: [0.25, -1], to: [0.25, 1], mover: [0.5, 0], kind: 'valley', bend: -1 },
          ],
        },
      ],
    },
  ],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'trunk', seat: [0, -0.15], scale: TRUNK },
    steps: [
      {
        text: 'Glue the biggest tier over the top of the trunk, so the trunk peeks out below.',
        actions: [{ kind: 'join', part: 'tier', ...TIERS[0] }],
      },
      {
        text: 'Glue the middle tier over the top of the big one, then the smallest over the top of the middle one.',
        actions: TIERS.slice(1).map(tier => ({ kind: 'join', part: 'tier', ...tier })),
      },
      {
        text: 'Draw a star on the top and a few baubles on the branches.',
        actions: [{ kind: 'draw', strokes: [...star, ...baubles] }],
      },
    ],
  },
}
