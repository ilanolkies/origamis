import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { head } from '../animal-faces/dog.js'
import { CM, cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TAIL_START = [0.2, 0]
const TAIL_ANGLE = 40
const CHEST = -0.45
const NECK_DEPTH = 0.5

export const dog = {
  id: 'dog',
  name: say('Sitting dog', 'Perro sentado'),
  kana: 'いぬ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    head,
    {
      id: 'body',
      name: say('Body', 'Cuerpo'),
      kanji: '体',
      tone: 'dog',
      paper: say(`${SIDE_CM} cm square, brown on one side`, `cuadrado de ${SIDE_CM} cm, marrón de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say(`Fold the right corner up to make the tail. Start the crease ${cm(TAIL_START[0])} cm right of the middle of the bottom edge and slant it up to the right edge.`, `Dobla la esquina derecha hacia arriba para hacer la cola. Empieza el pliegue a ${cm(TAIL_START[0])} cm a la derecha de la mitad del borde de abajo e inclínalo hacia arriba hasta el borde derecho.`),
          actions: [
            { from: TAIL_START, to: add(TAIL_START, polar(TAIL_ANGLE)), mover: [1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: say(`Fold the left corner behind along an upright crease ${cm(1 + CHEST)} cm from the tip.`, `Dobla la esquina izquierda hacia atrás por un pliegue vertical a ${cm(1 + CHEST)} cm de la punta.`),
          actions: [{ from: [CHEST, 0], to: [CHEST, 1], mover: [-1, 0], kind: 'mountain', bend: 1 }],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'body' },
    steps: [
      {
        text: say(`Slide the body's top point about ${Math.round(NECK_DEPTH * CM)} cm up behind the face. A dab of glue keeps it in place.`, `Desliza la punta de arriba del cuerpo unos ${Math.round(NECK_DEPTH * CM)} cm hacia arriba por detrás de la cara. Una gota de pegamento la mantiene en su lugar.`),
        actions: [{ kind: 'join', part: 'face', seat: [0, 2 - NECK_DEPTH] }],
      },
    ],
  },
}
