import { add, length, polar, sub } from '../../geometry.js'
import { CENTRE, CM, cm, DIAMOND, edgeReach, HALVE_UP, mirror, SIDE_CM } from '../shapes.js'

const BOTTOM = [0, -1]
const SHOULDER = Math.SQRT2 - 1
const LEAF_ANGLE = 30
const leafShoulder = polar(LEAF_ANGLE, edgeReach(LEAF_ANGLE))
const OVERLAP = 0.35

const lines = [
  [[-0.3, 0.12], [-0.12, 0.1]],
  [[0.1, -0.15], [0.26, -0.17]],
  [[-0.17, -0.45], [-0.05, -0.46]],
]

export const carrot = {
  id: 'carrot',
  name: 'Carrot',
  kana: 'にんじん',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'root',
      name: 'Root',
      kanji: '根',
      tone: 'carrot',
      paper: `${SIDE_CM} cm square, orange on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the two lower edges in to the centre line.',
          actions: [
            { from: BOTTOM, to: add(BOTTOM, polar(67.5)), mover: [1, 0], kind: 'valley', bend: -1 },
            { from: BOTTOM, to: add(BOTTOM, polar(112.5)), mover: [-1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: 'Fold the white top behind along the top edges of the flaps.',
          actions: [{ from: [-1, SHOULDER], to: [1, SHOULDER], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: 'Draw a few lines across the carrot.',
          actions: [{ kind: 'draw', strokes: lines }],
        },
      ],
    },
    {
      id: 'leaves',
      name: 'Leaves',
      kanji: '葉',
      tone: 'leaf',
      paper: `${SIDE_CM} cm square, green on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the bottom corner up to the top corner.',
          actions: [HALVE_UP],
        },
        {
          text: `Fold the right corner up so its tip stands beside the top point. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], leafShoulder)))} cm up the right edge.`,
          actions: [{ from: CENTRE, to: leafShoulder, mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: 'Repeat on the left, so three leaves stand up.',
          actions: [{ from: CENTRE, to: mirror(leafShoulder), mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
      ],
    },
  ],
  finish: {
    name: 'Finish',
    kanji: '完成',
    base: 'leaves',
    top: 'root',
    seat: [0, OVERLAP - SHOULDER],
    text: `Lay the carrot over the bottom of the leaves so about ${Math.round(OVERLAP * CM)} cm of them hides behind it. A dab of glue keeps it in place.`,
  },
}
