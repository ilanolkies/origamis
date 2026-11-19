import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { arc, cm, DIAMOND, edgeReach, HALVE_UP, SIDE_CM } from '../shapes.js'

const TOP = [0, 1]
const BASE = add(TOP, polar(281.25, 2 * edgeReach(78.75)))[1]
const SHOULDER = 0.5
const FIN = 0.65
const DROP = 0.05

export const rocket = {
  id: 'rocket',
  name: say('Rocket', 'Cohete'),
  kana: 'ロケット',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'body',
      name: say('Body', 'Cuerpo'),
      kanji: '胴',
      tone: 'rocket',
      paper: say(`${SIDE_CM} cm square, red on one side`, `cuadrado de ${SIDE_CM} cm, rojo de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the two upper edges in to the centre line.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla los dos bordes de arriba hacia la línea central.'),
          actions: [
            { from: TOP, to: add(TOP, polar(292.5)), mover: [1, 0], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(247.5)), mover: [-1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: say('Fold the long folded edges in to the centre line again.', 'Dobla de nuevo los bordes largos doblados hacia la línea central.'),
          actions: [
            { from: TOP, to: add(TOP, polar(281.25)), mover: [0.55, -0.4], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(258.75)), mover: [-0.55, -0.4], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: say('Fold the bottom point behind along the line between the side corners. The white tip left showing is the flame.', 'Dobla la punta de abajo hacia atrás por la línea que une las esquinas laterales. La punta blanca que queda a la vista es la llama.'),
          actions: [{ from: [-1, BASE], to: [1, BASE], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say('Draw a round window.', 'Dibuja una ventana redonda.'),
          actions: [{ kind: 'draw', strokes: [arc([0, 0.2], 0.08, 0, 360, 12)] }],
        },
      ],
    },
    {
      id: 'fins',
      name: say('Fins', 'Aletas'),
      kanji: '翼',
      tone: 'fins',
      paper: say(`${SIDE_CM} cm square, blue on one side`, `cuadrado de ${SIDE_CM} cm, azul de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say(`Fold the top point behind, ${cm(1 - SHOULDER)} cm down from the tip.`, `Dobla la punta de arriba hacia atrás, a ${cm(1 - SHOULDER)} cm hacia abajo desde la punta.`),
          actions: [{ from: [-1, SHOULDER], to: [1, SHOULDER], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say(`Fold the side tips behind along upright creases ${cm(1 - FIN)} cm in.`, `Dobla las puntas laterales hacia atrás por pliegues verticales a ${cm(1 - FIN)} cm hacia adentro.`),
          actions: [
            { from: [-FIN, 0], to: [-FIN, 1], mover: [-1, 0], kind: 'mountain', bend: 1 },
            { from: [FIN, 0], to: [FIN, 1], mover: [1, 0], kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'fins' },
    steps: [
      {
        text: say('Glue the body over the middle of the fins, its bottom edge level with theirs.', 'Pega el cuerpo sobre el medio de las aletas, con su borde de abajo a nivel con el de ellas.'),
        actions: [{ kind: 'join', part: 'body', seat: [0, -BASE - DROP] }],
      },
    ],
  },
}
