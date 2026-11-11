import { add, polar } from '../../geometry.js'
import { arc, LONG, SIDE_CM } from '../shapes.js'
import { SQUARE } from '../things/house.js'

const TOP = [0, LONG]
const WING_ANGLE = 207.5
const FEELER = 0.22

const wing = side => ({
  from: TOP,
  to: add(TOP, polar(side < 0 ? WING_ANGLE : 180 - WING_ANGLE)),
  mover: [side * LONG, LONG],
  kind: 'valley',
  bend: side,
  layers: 'top',
})

const feeler = side => arc(add(TOP, [side * FEELER, 0]), FEELER, side < 0 ? 0 : 180, side < 0 ? 70 : 110)

export const butterfly = {
  id: 'butterfly',
  name: 'Butterfly',
  kana: 'ちょうちょ',
  sheet: SQUARE,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'butterfly',
      name: 'Butterfly',
      kanji: '蝶',
      tone: 'butterfly',
      paper: `${SIDE_CM} cm square, coloured on one side`,
      steps: [
        {
          text: 'White side up. Crease both diagonals as valleys and both middles as mountains, then collapse into a waterbomb base, point down.',
          actions: [{ kind: 'collapse', base: 'waterbomb', toward: [0, 1] }],
        },
        {
          text: 'Fold the top corners of the front layer down and out past the sides to make the lower wings.',
          actions: [wing(-1), wing(1)],
        },
        {
          text: 'Draw two feelers at the top.',
          actions: [{ kind: 'draw', strokes: [feeler(-1), feeler(1)] }],
        },
      ],
    },
  ],
}
