import { say } from '../../i18n.js'
import { cm, HALF_SHEET, HALF_SHEET_CM, LONG, SHORT } from '../shapes.js'

const RIND = 0.1
const BASE = RIND - SHORT

const seed = ([x, y]) => [[x, y + 0.04], [x - 0.022, y - 0.005], [x, y - 0.03], [x + 0.022, y - 0.005], [x, y + 0.04]]

const seeds = [
  [-0.3, -0.07],
  [0, -0.07],
  [0.3, -0.07],
  [-0.15, 0.06],
  [0.15, 0.06],
  [0, 0.18],
].map(seed)

export const watermelon = {
  id: 'watermelon',
  name: say('Watermelon', 'Sandía'),
  kana: 'すいか',
  sheet: HALF_SHEET,
  paper: say(`${HALF_SHEET_CM} paper`, `papel de ${HALF_SHEET_CM}`),
  parts: [
    {
      id: 'slice',
      name: say('Slice', 'Rodaja'),
      kanji: '西瓜',
      tone: 'melon',
      back: 'rind',
      paper: say(`${HALF_SHEET_CM} rectangle, red on one side, green on the other`, `rectángulo de ${HALF_SHEET_CM}, rojo de un lado, verde del otro`),
      steps: [
        {
          text: say(`Green side up, a long edge toward you. Fold the bottom edge behind by ${cm(RIND)} cm.`, `Lado verde hacia arriba, un borde largo hacia ti. Dobla el borde de abajo hacia atrás ${cm(RIND)} cm.`),
          actions: [{ from: [-1, BASE], to: [1, BASE], mover: [0, -SHORT], kind: 'mountain', bend: 1 }],
        },
        {
          text: say('Turn the paper over. The green strip along the bottom is the rind.', 'Voltea el papel. La tira verde de abajo es la cáscara.'),
          actions: [{ kind: 'turn' }],
        },
        {
          text: say(`Fold the top corners behind along creases from ${cm(RIND)} cm either side of the middle of the top edge to the ends of the rind.`, `Dobla las esquinas de arriba hacia atrás por pliegues que van desde ${cm(RIND)} cm a cada lado de la mitad del borde de arriba hasta los extremos de la cáscara.`),
          actions: [
            { from: [-RIND, SHORT], to: [-LONG, BASE], mover: [-LONG, SHORT], kind: 'mountain', bend: 1 },
            { from: [RIND, SHORT], to: [LONG, BASE], mover: [LONG, SHORT], kind: 'mountain', bend: -1 },
          ],
        },
        {
          text: say('Draw the seeds.', 'Dibuja las semillas.'),
          actions: [{ kind: 'draw', strokes: seeds }],
        },
      ],
    },
  ],
}
