import { add, length, polar, scale, sub, unit } from '../../geometry.js'
import { say } from '../../i18n.js'

const SIDE_CM = 15
const CM = SIDE_CM / Math.SQRT2
const cm = units => (units * CM).toFixed(1)

const DIAMOND = [[0, 1], [-1, 0], [0, -1], [1, 0]]
const mirror = p => [-p[0], p[1]]

const CENTRE = [0, 0]
const PETAL_ANGLE = 30
const petalReach = 1 / (Math.cos((PETAL_ANGLE * Math.PI) / 180) + Math.sin((PETAL_ANGLE * Math.PI) / 180))
const shoulder = polar(PETAL_ANGLE, petalReach)
const petalTip = polar(2 * PETAL_ANGLE)
const TUCK = 0.13
const tuckLow = add(shoulder, scale(unit(sub(CENTRE, shoulder)), TUCK))
const tuckHigh = add(shoulder, scale(unit(sub(petalTip, shoulder)), TUCK))

const TOP = [0, 1]
const LEAF_START = [0, -0.35]
const LEAF_ANGLE = -20
const SEAT_DEPTH = 0.2

export const tulip = {
  id: 'tulip',
  name: say('Tulip', 'Tulipán'),
  kana: 'チューリップ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'bloom',
      name: say('Bloom', 'Flor'),
      kanji: '花',
      tone: 'petal',
      paper: say(`${SIDE_CM} cm square, pink on one side`, `cuadrado de ${SIDE_CM} cm, rosa de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [{ from: [-1, 0], to: [1, 0], mover: [0, -1], kind: 'valley', bend: 1 }],
        },
        {
          text: say(`Fold the right corner up so its tip stands beside the top point. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], shoulder)))} cm up the right edge.`, `Dobla la esquina derecha hacia arriba para que su punta quede junto a la punta de arriba. El pliegue va desde la mitad del borde de abajo hasta un punto a ${cm(length(sub([1, 0], shoulder)))} cm hacia arriba por el borde derecho.`),
          actions: [{ from: CENTRE, to: shoulder, mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: say('Repeat on the left. The two tips should sit level.', 'Repite a la izquierda. Las dos puntas deben quedar a la misma altura.'),
          actions: [{ from: CENTRE, to: mirror(shoulder), mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: say('Fold both side corners behind to round the bloom.', 'Dobla las dos esquinas laterales hacia atrás para redondear la flor.'),
          actions: [
            { from: tuckLow, to: tuckHigh, mover: shoulder, kind: 'mountain', bend: 1 },
            { from: mirror(tuckLow), to: mirror(tuckHigh), mover: mirror(shoulder), kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
    {
      id: 'stem',
      name: say('Stem', 'Tallo'),
      kanji: '茎',
      tone: 'leaf',
      paper: say(`${SIDE_CM} cm square, green on one side`, `cuadrado de ${SIDE_CM} cm, verde de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner pointing up. Fold the two upper edges in to the centre line.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia arriba. Dobla los dos bordes de arriba hacia la línea central.'),
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
          text: say('Fold in half lengthwise, left side over right.', 'Dobla por la mitad a lo largo, el lado izquierdo sobre el derecho.'),
          actions: [{ from: [0, -1], to: [0, 1], mover: [-0.3318, -0.6682], kind: 'valley', bend: -1 }],
        },
        {
          text: say(`Fold the bottom point up and out to the right to make the leaf. Start the crease ${cm(LEAF_START[1] + 1)} cm above the bottom point on the left, closed edge and slant it down to the right.`, `Dobla la punta de abajo hacia arriba y hacia afuera a la derecha para hacer la hoja. Empieza el pliegue a ${cm(LEAF_START[1] + 1)} cm por encima de la punta de abajo, en el borde cerrado de la izquierda, e inclínalo hacia abajo a la derecha.`),
          actions: [
            { from: LEAF_START, to: add(LEAF_START, polar(LEAF_ANGLE)), mover: [0, -1], kind: 'valley', bend: 1 },
          ],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'stem' },
    steps: [
      {
        text: say(`Snip 2 mm off the bottom tip of the bloom and slide the stem's point about ${Math.round(SEAT_DEPTH * CM)} cm into the slot. A dab of glue works too.`, `Recorta 2 mm de la punta de abajo de la flor y desliza la punta del tallo unos ${Math.round(SEAT_DEPTH * CM)} cm dentro de la ranura. Una gota de pegamento también sirve.`),
        actions: [{ kind: 'join', part: 'bloom', seat: [0.02, 1 - SEAT_DEPTH] }],
      },
    ],
  },
}
