import { add, length, polar, sub } from '../fold.js'

const SIDE_CM = 15
const CM = SIDE_CM / Math.SQRT2
const cm = units => (units * CM).toFixed(1)

const DIAMOND = [[0, 1], [-1, 0], [0, -1], [1, 0]]
const mirror = p => [-p[0], p[1]]
const CENTRE = [0, 0]
const HALVE = { from: [-1, 0], to: [1, 0], mover: [0, -1], kind: 'valley', bend: 1 }

const BROW = 0.55
const EAR_ANGLE = 34
const earReach = 1 / (Math.cos((EAR_ANGLE * Math.PI) / 180) + Math.sin((EAR_ANGLE * Math.PI) / 180))
const cheek = polar(EAR_ANGLE, earReach)

const TAIL_START = [0.15, 0]
const TAIL_ANGLE = 30
const CHEST = -0.45
const NECK_DEPTH = 0.28

const arc = (centre, radius, from, to, count = 8) =>
  Array.from({ length: count + 1 }, (_, i) => add(centre, polar(from + ((to - from) * i) / count, radius)))

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

const head = {
  id: 'head',
  name: 'Head',
  kanji: '頭',
  tone: 'fur',
  paper: `${SIDE_CM} cm square, orange on one side`,
  steps: [
    {
      text: 'White side up, a corner toward you. Fold the bottom corner up to the top corner.',
      folds: [HALVE],
    },
    {
      text: `Fold the top point behind. The crease sits ${cm(1 - BROW)} cm below the tip.`,
      folds: [{ from: [-1, BROW], to: [1, BROW], mover: [0, 1], kind: 'mountain', bend: 1 }],
    },
    {
      text: `Fold the right corner up behind to make an ear. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], cheek)))} cm up the right edge.`,
      folds: [{ from: CENTRE, to: cheek, mover: [1, 0], kind: 'mountain', bend: -1 }],
    },
    {
      text: 'Repeat on the left. The two ears should sit level.',
      folds: [{ from: CENTRE, to: mirror(cheek), mover: [-1, 0], kind: 'mountain', bend: 1 }],
    },
    {
      text: 'Draw the face: happy eyes, a nose, whiskers and three stripes.',
      draw: face,
    },
  ],
}

export const cat = {
  id: 'cat',
  name: 'Sitting cat',
  kana: 'ねこ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    head,
    {
      id: 'body',
      name: 'Body',
      kanji: '体',
      tone: 'fur',
      paper: `${SIDE_CM} cm square, orange on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the bottom corner up to the top corner.',
          folds: [HALVE],
        },
        {
          text: `Fold the right corner up to make the tail. Start the crease ${cm(TAIL_START[0])} cm right of the middle of the bottom edge and slant it up to the right edge.`,
          folds: [
            { from: TAIL_START, to: add(TAIL_START, polar(TAIL_ANGLE)), mover: [1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: `Fold the left corner behind along an upright crease ${cm(1 + CHEST)} cm from the tip.`,
          folds: [{ from: [CHEST, 0], to: [CHEST, 1], mover: [-1, 0], kind: 'mountain', bend: 1 }],
        },
      ],
    },
  ],
  finish: {
    name: 'Finish',
    kanji: '完成',
    base: 'body',
    top: 'head',
    seat: [0, 1 - NECK_DEPTH],
    text: `Slide the body's top point about ${Math.round(NECK_DEPTH * CM)} cm up behind the face, in front of the folded-down flap. A dab of glue keeps it in place.`,
  },
}

export const catFace = {
  id: 'cat-face',
  name: 'Cat face',
  kana: 'ねこ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [head],
}
