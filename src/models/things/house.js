import { LONG, SIDE_CM } from '../shapes.js'

const HALF = LONG / 2

export const SQUARE = [[-LONG, -LONG], [LONG, -LONG], [LONG, LONG], [-LONG, LONG]]

const side = sign => ({ from: [sign * HALF, -LONG], to: [sign * HALF, 0], mover: [sign * LONG, -HALF], kind: 'valley', bend: sign })
const roof = sign => ({
  kind: 'squash',
  from: [sign * HALF, -LONG],
  to: [sign * HALF, 0],
  mover: [0, 0],
  diagonal: [[sign * HALF, 0], [0, -HALF]],
  bend: -sign,
})

export const houseSteps = [
  {
    text: 'Coloured side down. Fold the top edge down to the bottom edge.',
    actions: [{ from: [-LONG, 0], to: [LONG, 0], mover: [0, LONG], kind: 'valley', bend: -1 }],
  },
  {
    text: 'Fold in half from side to side and unfold, leaving a crease down the middle.',
    actions: [{ from: [0, -LONG], to: [0, 0], mover: [LONG, -HALF], kind: 'crease', bend: 1 }],
  },
  {
    text: 'Fold the left and right edges in to the middle crease.',
    actions: [side(-1), side(1)],
  },
  {
    text: 'Lift the left flap, open its top and squash it flat into a triangle for the roof.',
    actions: [roof(-1)],
  },
  {
    text: 'Squash the right flap the same way.',
    actions: [roof(1)],
  },
]

export const house = {
  id: 'house',
  name: 'House',
  kana: 'いえ',
  sheet: SQUARE,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'house',
      name: 'House',
      kanji: '家',
      tone: 'roof',
      paper: `${SIDE_CM} cm square, red on one side`,
      steps: houseSteps,
    },
  ],
}
