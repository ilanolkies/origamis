import { add, length, polar, sub } from '../../geometry.js'
import { say } from '../../i18n.js'
import { CENTRE, CM, cm, DIAMOND, edgeReach, HALVE_UP, mirror, SIDE_CM } from '../shapes.js'

const BOTTOM = [0, -1]
const SHOULDER = Math.SQRT2 - 1
const LEAF_ANGLE = 30
const leafShoulder = polar(LEAF_ANGLE, edgeReach(LEAF_ANGLE))
const OVERLAP = 0.35

const lines = [
  [[-0.3, 0.12], [-0.12, 0.1]],
  [[0.1, -0.15], [0.26, -0.17]],
  [[-0.17, -0.45], [-0.05, -0.46]],
]

export const carrot = {
  id: 'carrot',
  name: say('Carrot', 'Zanahoria'),
  kana: 'にんじん',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'root',
      name: say('Root', 'Raíz'),
      kanji: '根',
      tone: 'carrot',
      paper: say(`${SIDE_CM} cm square, orange on one side`, `cuadrado de ${SIDE_CM} cm, naranja de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the two lower edges in to the centre line.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla los dos bordes de abajo hacia la línea central.'),
          actions: [
            { from: BOTTOM, to: add(BOTTOM, polar(67.5)), mover: [1, 0], kind: 'valley', bend: -1 },
            { from: BOTTOM, to: add(BOTTOM, polar(112.5)), mover: [-1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Fold the white top behind along the top edges of the flaps.', 'Dobla la parte blanca de arriba hacia atrás por los bordes de arriba de las solapas.'),
          actions: [{ from: [-1, SHOULDER], to: [1, SHOULDER], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say('Draw a few lines across the carrot.', 'Dibuja unas líneas a lo ancho de la zanahoria.'),
          actions: [{ kind: 'draw', strokes: lines }],
        },
      ],
    },
    {
      id: 'leaves',
      name: say('Leaves', 'Hojas'),
      kanji: '葉',
      tone: 'leaf',
      paper: say(`${SIDE_CM} cm square, green on one side`, `cuadrado de ${SIDE_CM} cm, verde de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say(`Fold the right corner up so its tip stands beside the top point. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], leafShoulder)))} cm up the right edge.`, `Dobla la esquina derecha hacia arriba para que su punta quede junto a la punta de arriba. El pliegue va desde la mitad del borde de abajo hasta un punto a ${cm(length(sub([1, 0], leafShoulder)))} cm hacia arriba por el borde derecho.`),
          actions: [{ from: CENTRE, to: leafShoulder, mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: say('Repeat on the left, so three leaves stand up.', 'Repite a la izquierda, así quedan tres hojas paradas.'),
          actions: [{ from: CENTRE, to: mirror(leafShoulder), mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'leaves' },
    steps: [
      {
        text: say(`Lay the carrot over the bottom of the leaves so about ${Math.round(OVERLAP * CM)} cm of them hides behind it. A dab of glue keeps it in place.`, `Coloca la zanahoria sobre la parte de abajo de las hojas de modo que unos ${Math.round(OVERLAP * CM)} cm de ellas queden escondidos detrás. Una gota de pegamento la mantiene en su lugar.`),
        actions: [{ kind: 'join', part: 'root', seat: [0, OVERLAP - SHOULDER] }],
      },
    ],
  },
}
