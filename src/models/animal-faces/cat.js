import { length, polar, sub } from '../../geometry.js'
import { arc, CENTRE, cm, DIAMOND, edgeReach, HALVE_UP, mirror, SIDE_CM } from '../shapes.js'

const BROW = 0.55
const EAR_ANGLE = 34
const cheek = polar(EAR_ANGLE, edgeReach(EAR_ANGLE))

const whiskers = [
  [[0.15, 0.285], [0.4, 0.315]],
  [[0.15, 0.265], [0.36, 0.262]],
]

const face = [
  arc([-0.2, 0.36], 0.07, 160, 20),
  arc([0.2, 0.36], 0.07, 160, 20),
  [[-0.03, 0.275], [0.03, 0.275], [0, 0.245], [-0.03, 0.275]],
  [[0, 0.245], ...arc([-0.04, 0.215], 0.04, 0, -180)],
  arc([0.04, 0.215], 0.04, 180, 360),
  ...whiskers,
  ...whiskers.map(stroke => stroke.map(mirror)),
  [[-0.08, 0.545], [-0.07, 0.49]],
  [[0, 0.545], [0, 0.47]],
  [[0.08, 0.545], [0.07, 0.49]],
]

export const head = {
  id: 'head',
  name: 'Head',
  kanji: '頭',
  tone: 'fur',
  paper: `${SIDE_CM} cm square, orange on one side`,
  steps: [
    {
      text: 'White side up, a corner toward you. Fold the bottom corner up to the top corner.',
      actions: [HALVE_UP],
    },
    {
      text: `Fold the top point behind. The crease sits ${cm(1 - BROW)} cm below the tip.`,
      actions: [{ from: [-1, BROW], to: [1, BROW], mover: [0, 1], kind: 'mountain', bend: 1 }],
    },
    {
      text: `Fold the right corner up behind to make an ear. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], cheek)))} cm up the right edge.`,
      actions: [{ from: CENTRE, to: cheek, mover: [1, 0], kind: 'mountain', bend: -1 }],
    },
    {
      text: 'Repeat on the left. The two ears should sit level.',
      actions: [{ from: CENTRE, to: mirror(cheek), mover: [-1, 0], kind: 'mountain', bend: 1 }],
    },
    {
      text: 'Draw the face: happy eyes, a nose, whiskers and three stripes.',
      actions: [{ kind: 'draw', strokes: face }],
    },
  ],
}

export const catFace = {
  id: 'cat-face',
  name: 'Cat face',
  kana: 'ねこ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [head],
}
