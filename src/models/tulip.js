import { add, length, polar, scale, sub, unit } from '../fold.js'

const SIDE_CM = 15
const CM = SIDE_CM / Math.SQRT2
const cm = units => (units * CM).toFixed(1)

const DIAMOND = [[0, 1], [-1, 0], [0, -1], [1, 0]]
const mirror = p => [-p[0], p[1]]

const CENTRE = [0, 0]
const PETAL_ANGLE = 30
const petalReach = 1 / (Math.cos((PETAL_ANGLE * Math.PI) / 180) + Math.sin((PETAL_ANGLE * Math.PI) / 180))
const shoulder = polar(PETAL_ANGLE, petalReach)
const petalTip = polar(2 * PETAL_ANGLE)
const TUCK = 0.13
const tuckLow = add(shoulder, scale(unit(sub(CENTRE, shoulder)), TUCK))
const tuckHigh = add(shoulder, scale(unit(sub(petalTip, shoulder)), TUCK))

const TOP = [0, 1]
const LEAF_START = [0, -0.35]
const LEAF_ANGLE = -20
const SEAT_DEPTH = 0.2

export const tulip = {
  id: 'tulip',
  name: 'Tulip',
  kana: 'チューリップ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'bloom',
      name: 'Bloom',
      kanji: '花',
      tone: 'petal',
      paper: `${SIDE_CM} cm square, pink on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the bottom corner up to the top corner.',
          folds: [{ from: [-1, 0], to: [1, 0], mover: [0, -1], kind: 'valley', bend: 1 }],
        },
        {
          text: `Fold the right corner up so its tip stands beside the top point. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], shoulder)))} cm up the right edge.`,
          folds: [{ from: CENTRE, to: shoulder, mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: 'Repeat on the left. The two tips should sit level.',
          folds: [{ from: CENTRE, to: mirror(shoulder), mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: 'Fold both side corners behind to round the bloom.',
          folds: [
            { from: tuckLow, to: tuckHigh, mover: shoulder, kind: 'mountain', bend: 1 },
            { from: mirror(tuckLow), to: mirror(tuckHigh), mover: mirror(shoulder), kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
    {
      id: 'stem',
      name: 'Stem',
      kanji: '茎',
      tone: 'leaf',
      paper: `${SIDE_CM} cm square, green on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner pointing up. Fold the two upper edges in to the centre line.',
          folds: [
            { from: TOP, to: add(TOP, polar(292.5)), mover: [1, 0], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(247.5)), mover: [-1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: 'Fold the long folded edges in to the centre line again.',
          folds: [
            { from: TOP, to: add(TOP, polar(281.25)), mover: [0.55, -0.4], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(258.75)), mover: [-0.55, -0.4], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: 'Fold in half lengthwise, left side over right.',
          folds: [{ from: [0, -1], to: [0, 1], mover: [-0.3318, -0.6682], kind: 'valley', bend: -1 }],
        },
        {
          text: `Fold the bottom point up and out to the right to make the leaf. Start the crease ${cm(LEAF_START[1] + 1)} cm above the bottom point on the left, closed edge and slant it down to the right.`,
          folds: [
            { from: LEAF_START, to: add(LEAF_START, polar(LEAF_ANGLE)), mover: [0, -1], kind: 'valley', bend: 1 },
          ],
        },
      ],
    },
  ],
  finish: {
    name: 'Finish',
    kanji: '完成',
    base: 'stem',
    top: 'bloom',
    seat: [0.02, 1 - SEAT_DEPTH],
    text: `Snip 2 mm off the bottom tip of the bloom and slide the stem's point about ${Math.round(SEAT_DEPTH * CM)} cm into the slot. A dab of glue works too.`,
  },
}
