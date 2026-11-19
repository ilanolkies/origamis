import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { CM, cm, DIAMOND, SIDE_CM } from '../shapes.js'

const BOTTOM = [0, -1]
const RIM = Math.SQRT2 - 1
const FLAT = -0.35
const SIDE = 0.7
const TOP = 0.6
const OVERLAP = 0.15

const waffle = [
  [[-0.38, 0.3], [0.08, -0.48]],
  [[-0.08, 0.3], [0.2, -0.18]],
  [[0.38, 0.3], [-0.08, -0.48]],
  [[0.08, 0.3], [-0.2, -0.18]],
]

export const iceCream = {
  id: 'ice-cream',
  name: say('Ice cream', 'Helado'),
  kana: 'アイスクリーム',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'scoop',
      name: say('Scoop', 'Bola'),
      kanji: '玉',
      tone: 'cream',
      paper: say(`${SIDE_CM} cm square, pink on one side`, `cuadrado de ${SIDE_CM} cm, rosa de un lado`),
      steps: [
        {
          text: say(`White side up, a corner toward you. Fold the bottom corner up along a crease ${cm(1 + FLAT)} cm above it.`, `Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia arriba por un pliegue a ${cm(1 + FLAT)} cm por encima de ella.`),
          actions: [{ from: [-1, FLAT], to: [1, FLAT], mover: [0, -1], kind: 'valley', bend: 1 }],
        },
        {
          text: say(`Fold the side corners in along upright creases ${cm(1 - SIDE)} cm from the tips.`, `Dobla las esquinas laterales hacia adentro por pliegues verticales a ${cm(1 - SIDE)} cm de las puntas.`),
          actions: [
            { from: [-SIDE, 0], to: [-SIDE, 1], mover: [-1, 0], kind: 'valley', bend: -1 },
            { from: [SIDE, 0], to: [SIDE, 1], mover: [1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say(`Fold the top corner down, ${cm(1 - TOP)} cm from the tip.`, `Dobla la esquina de arriba hacia abajo, a ${cm(1 - TOP)} cm de la punta.`),
          actions: [{ from: [-1, TOP], to: [1, TOP], mover: [0, 1], kind: 'valley', bend: -1 }],
        },
        {
          text: say('Turn the paper over: a round pink scoop.', 'Voltea el papel: una bola rosa redonda.'),
          actions: [{ kind: 'turn' }],
        },
      ],
    },
    {
      id: 'cone',
      name: say('Cone', 'Cono'),
      kanji: 'コーン',
      tone: 'cone',
      paper: say(`${SIDE_CM} cm square, light brown on one side`, `cuadrado de ${SIDE_CM} cm, marrón claro de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the two lower edges in to the centre line.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla los dos bordes de abajo hacia la línea central.'),
          actions: [
            { from: BOTTOM, to: add(BOTTOM, polar(67.5)), mover: [1, 0], kind: 'valley', bend: -1 },
            { from: BOTTOM, to: add(BOTTOM, polar(112.5)), mover: [-1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Fold the white top behind along the top edges of the flaps.', 'Dobla la parte blanca de arriba hacia atrás por los bordes de arriba de las solapas.'),
          actions: [{ from: [-1, RIM], to: [1, RIM], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say('Draw a criss-cross waffle pattern on the cone.', 'Dibuja un cuadriculado de barquillo en el cono.'),
          actions: [{ kind: 'draw', strokes: waffle }],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'scoop' },
    steps: [
      {
        text: say(`Lay the cone over the bottom of the scoop so about ${Math.round(OVERLAP * CM)} cm of the scoop tucks behind it. A dab of glue keeps it in place.`, `Coloca el cono sobre la parte de abajo de la bola de modo que unos ${Math.round(OVERLAP * CM)} cm de la bola queden escondidos detrás. Una gota de pegamento lo mantiene en su lugar.`),
        actions: [{ kind: 'join', part: 'cone', seat: [0, FLAT + OVERLAP - RIM] }],
      },
    ],
  },
}
