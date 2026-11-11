import { add, length, polar, sub } from '../../geometry.js'
import { arc, cm, DIAMOND, SIDE_CM } from '../shapes.js'

const PETALS = 5
const TURN = 360 / PETALS
const BOTTOM = [0, -1]
const SPREAD = 90 - TURN / 2
const ROUND = 0.12
const NOTCH = 0.8
const CENTRE = [0, 0]

const reach = 2 / (Math.cos((SPREAD * Math.PI) / 180) + Math.sin((SPREAD * Math.PI) / 180))
const SHOULDER = add(BOTTOM, polar(SPREAD, reach))
const shoulderDrop = length(sub([1, 0], SHOULDER))
const INWARD = (180 + SPREAD + 135) / 2

const round = (corner, inward, bend) => {
  const from = add(corner, polar(inward, ROUND))
  return { from, to: add(from, polar(inward + 90)), mover: corner, kind: 'mountain', bend }
}

const petalAt = k => ({ seat: polar(90 + k * TURN), rotate: k * TURN })

const middle = [
  arc(CENTRE, 0.14, 0, 360, 12),
  ...Array.from({ length: PETALS }, (_, k) => {
    const angle = 90 + k * TURN
    return [polar(angle, 0.14), polar(angle, 0.42), ...arc(polar(angle, 0.45), 0.03, 0, 360, 6)]
  }),
]

export const cherryBlossom = {
  id: 'cherry-blossom',
  name: 'Cherry blossom',
  kana: 'さくら',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'petal',
      name: 'Petal',
      kanji: '花びら',
      tone: 'petal',
      copies: PETALS,
      paper: `${PETALS} squares of ${SIDE_CM} cm, pink on one side`,
      steps: [
        {
          text: `Fold all ${PETALS} squares the same way. White side up, a corner toward you. Fold the two lower edges in along creases from the bottom corner to spots ${cm(shoulderDrop)} cm above the side corners.`,
          actions: [
            { from: BOTTOM, to: add(BOTTOM, polar(SPREAD)), mover: [1, 0], kind: 'valley', bend: -1 },
            { from: BOTTOM, to: add(BOTTOM, polar(180 - SPREAD)), mover: [-1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: 'Turn the paper over.',
          actions: [{ kind: 'turn' }],
        },
        {
          text: `Fold the top tip down ${cm(1 - NOTCH)} cm: the white tip is the notch of the petal.`,
          actions: [{ from: [-1, NOTCH], to: [1, NOTCH], mover: [0, 1], kind: 'valley', bend: -1 }],
        },
        {
          text: 'Fold the two side corners behind a little to round the petal.',
          actions: [round(SHOULDER, INWARD, 1), round([-SHOULDER[0], SHOULDER[1]], 180 - INWARD, -1)],
        },
      ],
    },
  ],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'petal', ...petalAt(0) },
    steps: [
      {
        text: `Glue the other ${PETALS - 1} petals around the first, their bottom points meeting in the middle, each turned a fifth of a turn from the last.`,
        actions: Array.from({ length: PETALS - 1 }, (_, k) => ({ kind: 'join', part: 'petal', ...petalAt(k + 1) })),
      },
      {
        text: 'Draw the centre of the flower: a small circle with five stamens.',
        actions: [{ kind: 'draw', strokes: middle }],
      },
    ],
  },
}
