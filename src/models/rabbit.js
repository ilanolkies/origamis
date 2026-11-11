import { length, polar, sub } from '../fold.js'
import { arc, CENTRE, cm, DIAMOND, edgeReach, HALVE_UP, mirror, SIDE_CM } from './shapes.js'

const BROW = 0.7
const EAR_ANGLE = 40
const cheek = polar(EAR_ANGLE, edgeReach(EAR_ANGLE))

const whole = strokes => [...strokes, ...strokes.map(stroke => stroke.map(mirror))]

const face = [
  ...whole([arc([0.17, 0.3], 0.04, 0, 360, 10)]),
  [[-0.04, 0.17], [0.04, 0.17], [0, 0.12], [-0.04, 0.17]],
  [[0, 0.12], [0, 0.08]],
  [[0, 0.08], ...arc([-0.05, 0.08], 0.05, 0, -150, 6)],
  [[0, 0.08], ...arc([0.05, 0.08], 0.05, 180, 330, 6)],
  ...whole([[[0.14, 0.14], [0.4, 0.17]], [[0.14, 0.11], [0.4, 0.09]]]),
]

export const rabbit = {
  id: 'rabbit-face',
  name: 'Rabbit face',
  kana: 'うさぎ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'face',
      name: 'Face',
      kanji: '顔',
      tone: 'rabbit',
      paper: `${SIDE_CM} cm square, grey on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the bottom corner up to the top corner.',
          folds: [HALVE_UP],
        },
        {
          text: `Fold the top point behind. The crease sits ${cm(1 - BROW)} cm below the tip.`,
          folds: [{ from: [-1, BROW], to: [1, BROW], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: `Fold the right corner up to make a long ear. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], cheek)))} cm up the right edge.`,
          folds: [{ from: CENTRE, to: cheek, mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: 'Repeat on the left. The two ears should stand level.',
          folds: [{ from: CENTRE, to: mirror(cheek), mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: 'Draw the face: round eyes, a little nose, a mouth and whiskers.',
          draw: face,
        },
      ],
    },
  ],
}
