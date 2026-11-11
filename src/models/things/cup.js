import { DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const RIM = 2 - Math.SQRT2
const HINGE = (Math.SQRT2 - 1) ** 2
const REACH = Math.SQRT2 - 1

const across = side => ({ from: [side * HINGE, 0], to: [side * REACH, RIM], mover: [side, 0], kind: 'valley', bend: 1 })
const top = (kind, layers, into) => ({ from: [-1, RIM], to: [1, RIM], mover: [0, 1], kind, bend: 1, layers, into })

export const cup = {
  id: 'cup',
  name: 'Cup',
  kana: 'コップ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'cup',
      name: 'Cup',
      kanji: '杯',
      tone: 'cup',
      paper: `${SIDE_CM} cm square, blue on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the bottom corner up to the top corner.',
          actions: [HALVE_UP],
        },
        {
          text: 'Fold the right corner across to the left edge, so the top of the flap lies level.',
          actions: [across(1)],
        },
        {
          text: 'Fold the left corner across to the right edge the same way.',
          actions: [across(-1)],
        },
        {
          text: 'Fold the front top corner down and tuck it into the pocket of the flap in front.',
          actions: [top('valley', 'top', 1)],
        },
        {
          text: 'Fold the back top corner down behind.',
          actions: [top('mountain', 'bottom')],
        },
      ],
    },
  ],
}
