import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { head } from '../animal-faces/cat.js'
import { CM, cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TAIL_START = [0.15, 0]
const TAIL_ANGLE = 30
const CHEST = -0.45
const NECK_DEPTH = 0.28

export const cat = {
  id: 'cat',
  name: say('Sitting cat', 'Gato sentado'),
  kana: 'ねこ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    head,
    {
      id: 'body',
      name: say('Body', 'Cuerpo'),
      kanji: '体',
      tone: 'fur',
      paper: say(`${SIDE_CM} cm square, orange on one side`, `cuadrado de ${SIDE_CM} cm, naranja de un lado`),
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
        text: say(`Slide the body's top point about ${Math.round(NECK_DEPTH * CM)} cm up behind the face, in front of the folded-down flap. A dab of glue keeps it in place.`, `Desliza la punta de arriba del cuerpo unos ${Math.round(NECK_DEPTH * CM)} cm hacia arriba por detrás de la cara, por delante de la solapa doblada hacia abajo. Una gota de pegamento la mantiene en su lugar.`),
        actions: [{ kind: 'join', part: 'head', seat: [0, 1 - NECK_DEPTH] }],
      },
    ],
  },
}
