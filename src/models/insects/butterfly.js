import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
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
  name: say('Butterfly', 'Mariposa'),
  kana: 'ちょうちょ',
  sheet: SQUARE,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'butterfly',
      name: say('Butterfly', 'Mariposa'),
      kanji: '蝶',
      tone: 'butterfly',
      paper: say(`${SIDE_CM} cm square, coloured on one side`, `cuadrado de ${SIDE_CM} cm, de color de un lado`),
      steps: [
        {
          text: say('White side up. Crease both diagonals as valleys and both middles as mountains, then collapse into a waterbomb base, point down.', 'Lado blanco hacia arriba. Marca las dos diagonales como valles y las dos mitades como montañas, y luego pliega hasta formar una base bomba de agua, con la punta hacia abajo.'),
          actions: [{ kind: 'collapse', base: 'waterbomb', toward: [0, 1] }],
        },
        {
          text: say('Fold the top corners of the front layer down and out past the sides to make the lower wings.', 'Dobla las esquinas de arriba de la capa de adelante hacia abajo y hacia afuera, más allá de los lados, para hacer las alas de abajo.'),
          actions: [wing(-1), wing(1)],
        },
        {
          text: say('Draw two feelers at the top.', 'Dibuja dos antenas arriba.'),
          actions: [{ kind: 'draw', strokes: [feeler(-1), feeler(1)] }],
        },
      ],
    },
  ],
}
