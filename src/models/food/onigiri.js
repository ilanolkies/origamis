import { add, length, polar, sub } from '../../geometry.js'
import { say } from '../../i18n.js'
import { cm, DIAMOND, edgeReach, SIDE_CM } from '../shapes.js'

const TOP = [0, 1]
const SLANT = 60
const [SHOULDER_X, SHOULDER] = add(TOP, polar(-SLANT, 2 * edgeReach(SLANT)))
const TIP = 0.8
const CORNER = 0.6
const BAND = 0.35
const WIDTH = 0.5
const WRAP = 0.05

export const onigiri = {
  id: 'onigiri',
  name: say('Onigiri', 'Onigiri'),
  kana: 'おにぎり',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'rice',
      name: say('Rice', 'Arroz'),
      kanji: 'ご飯',
      tone: 'rice',
      paper: say(`${SIDE_CM} cm square, white on one side`, `cuadrado de ${SIDE_CM} cm, blanco de un lado`),
      steps: [
        {
          text: say(`White side up, a corner toward you. Fold the two side corners behind along creases from the top corner to spots ${cm(length(sub([1, 0], [SHOULDER_X, SHOULDER])))} cm down the lower edges.`, `Lado blanco hacia arriba, una esquina hacia ti. Dobla las dos esquinas laterales hacia atrás por pliegues que van desde la esquina de arriba hasta puntos a ${cm(length(sub([1, 0], [SHOULDER_X, SHOULDER])))} cm hacia abajo por los bordes de abajo.`),
          actions: [
            { from: TOP, to: add(TOP, polar(-SLANT)), mover: [1, 0], kind: 'mountain', bend: -1 },
            { from: TOP, to: add(TOP, polar(SLANT + 180)), mover: [-1, 0], kind: 'mountain', bend: 1 },
          ],
        },
        {
          text: say('Fold the bottom corner up behind, along the line between the side corners.', 'Dobla la esquina de abajo hacia arriba por detrás, por la línea que une las esquinas laterales.'),
          actions: [{ from: [-1, SHOULDER], to: [1, SHOULDER], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say(`Round the rice ball: fold the top tip behind ${cm(1 - TIP)} cm down, and both bottom tips behind along upright creases ${cm(SHOULDER_X - CORNER)} cm in.`, `Redondea la bola de arroz: dobla la punta de arriba hacia atrás ${cm(1 - TIP)} cm hacia abajo, y las dos puntas de abajo hacia atrás por pliegues verticales a ${cm(SHOULDER_X - CORNER)} cm hacia adentro.`),
          actions: [
            { from: [-1, TIP], to: [1, TIP], mover: [0, 1], kind: 'mountain', bend: 1 },
            { from: [-CORNER, 0], to: [-CORNER, 1], mover: [-1, -1], kind: 'mountain', bend: 1 },
            { from: [CORNER, 0], to: [CORNER, 1], mover: [1, -1], kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
    {
      id: 'nori',
      name: say('Nori', 'Nori'),
      kanji: '海苔',
      tone: 'nori',
      paper: say(`${SIDE_CM} cm square, dark green on one side`, `cuadrado de ${SIDE_CM} cm, verde oscuro de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the left corner over to the right corner.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina izquierda hacia la esquina derecha.'),
          actions: [{ from: [0, -1], to: [0, 1], mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: say('Fold the right corner back to the fold, along an upright crease halfway across.', 'Dobla la esquina derecha de vuelta hasta el pliegue, por un pliegue vertical a mitad de camino.'),
          actions: [{ from: [WIDTH, -1], to: [WIDTH, 1], mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: say(`Fold the top and bottom points behind, ${cm(1 - BAND)} cm from each tip, to make a strip.`, `Dobla las puntas de arriba y de abajo hacia atrás, a ${cm(1 - BAND)} cm de cada punta, para hacer una tira.`),
          actions: [
            { from: [-1, BAND], to: [1, BAND], mover: [0, 1], kind: 'mountain', bend: 1 },
            { from: [-1, -BAND], to: [1, -BAND], mover: [0, -1], kind: 'mountain', bend: -1 },
          ],
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
        text: say('Wrap the strip over the bottom middle of the rice ball, so it pokes out a little below. A dab of glue keeps it in place.', 'Envuelve la tira sobre la parte de abajo del centro de la bola de arroz, de modo que sobresalga un poco por abajo. Una gota de pegamento la mantiene en su lugar.'),
        actions: [{ kind: 'join', part: 'nori', seat: [-WIDTH / 2, BAND - WRAP + SHOULDER] }],
      },
    ],
  },
}
