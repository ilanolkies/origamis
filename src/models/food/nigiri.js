import { say } from '../../i18n.js'
import { cm, HALF_SHEET, HALF_SHEET_CM, LONG, SHORT } from '../shapes.js'

const MIDDLE = SHORT / 2
const END = 0.55
const ROUND = 0.06
const EDGE = 0.2
const FISH = SHORT - EDGE
const CORNER = 0.1
const SEAT = 0.02

const corners = (x, y, k, kind) =>
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => ({
    from: [sx * (x - k), sy * y],
    to: [sx * x, sy * (y - k)],
    mover: [sx * x, sy * y],
    kind,
    bend: sx * sy,
  }))

const stripes = [-0.45, -0.2, 0.05, 0.3].map(x => [[x, -0.11], [x + 0.1, 0.11]])

export const nigiri = {
  id: 'nigiri',
  name: say('Nigiri', 'Nigiri'),
  kana: 'にぎりずし',
  sheet: HALF_SHEET,
  paper: say(`${HALF_SHEET_CM} paper`, `papel de ${HALF_SHEET_CM}`),
  parts: [
    {
      id: 'rice',
      name: say('Rice', 'Arroz'),
      kanji: 'シャリ',
      tone: 'rice',
      paper: say(`${HALF_SHEET_CM} rectangle, white on one side`, `rectángulo de ${HALF_SHEET_CM}, blanco de un lado`),
      steps: [
        {
          text: say('White side up, a long edge toward you. Fold the top and bottom edges in to the centre line.', 'Lado blanco hacia arriba, un borde largo hacia ti. Dobla los bordes de arriba y de abajo hacia la línea central.'),
          actions: [
            { from: [-1, MIDDLE], to: [1, MIDDLE], mover: [0, SHORT], kind: 'valley', bend: -1 },
            { from: [-1, -MIDDLE], to: [1, -MIDDLE], mover: [0, -SHORT], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say(`Fold the ends behind along upright creases ${cm(LONG - END)} cm in.`, `Dobla los extremos hacia atrás por pliegues verticales a ${cm(LONG - END)} cm hacia adentro.`),
          actions: [
            { from: [-END, 0], to: [-END, 1], mover: [-LONG, 0], kind: 'mountain', bend: 1 },
            { from: [END, 0], to: [END, 1], mover: [LONG, 0], kind: 'mountain', bend: -1 },
          ],
        },
        {
          text: say('Fold the four corners behind a little to round the rice.', 'Dobla un poco las cuatro esquinas hacia atrás para redondear el arroz.'),
          actions: corners(END, MIDDLE, ROUND, 'mountain'),
        },
      ],
    },
    {
      id: 'fish',
      name: say('Fish', 'Pescado'),
      kanji: 'ネタ',
      tone: 'salmon',
      paper: say(`${HALF_SHEET_CM} rectangle, orange on one side`, `rectángulo de ${HALF_SHEET_CM}, naranja de un lado`),
      steps: [
        {
          text: say(`New sheet, white side up, a long edge toward you. Fold the top and bottom edges in by ${cm(EDGE)} cm.`, `Hoja nueva, lado blanco hacia arriba, un borde largo hacia ti. Dobla los bordes de arriba y de abajo hacia adentro ${cm(EDGE)} cm.`),
          actions: [
            { from: [-1, SHORT - EDGE], to: [1, SHORT - EDGE], mover: [0, SHORT], kind: 'valley', bend: -1 },
            { from: [-1, EDGE - SHORT], to: [1, EDGE - SHORT], mover: [0, -SHORT], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say(`Fold the four corners in, ${cm(CORNER)} cm along each edge.`, `Dobla las cuatro esquinas hacia adentro, ${cm(CORNER)} cm a lo largo de cada borde.`),
          actions: corners(LONG, FISH, CORNER, 'valley'),
        },
        {
          text: say('Turn the paper over.', 'Voltea el papel.'),
          actions: [{ kind: 'turn' }],
        },
        {
          text: say('Draw the stripes of the fish.', 'Dibuja las rayas del pescado.'),
          actions: [{ kind: 'draw', strokes: stripes }],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'rice' },
    steps: [
      {
        text: say('Lay the fish over the top half of the rice, so the rice shows below it. A dab of glue keeps it in place.', 'Coloca el pescado sobre la mitad de arriba del arroz, de modo que el arroz se vea por debajo. Una gota de pegamento lo mantiene en su lugar.'),
        actions: [{ kind: 'join', part: 'fish', seat: [0, FISH + SEAT] }],
      },
    ],
  },
}
