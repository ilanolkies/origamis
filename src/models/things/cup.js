import { say } from '../../i18n.js'
import { DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const RIM = 2 - Math.SQRT2
const HINGE = (Math.SQRT2 - 1) ** 2
const REACH = Math.SQRT2 - 1

const across = side => ({ from: [side * HINGE, 0], to: [side * REACH, RIM], mover: [side, 0], kind: 'valley', bend: 1 })
const top = (kind, layers, into) => ({ from: [-1, RIM], to: [1, RIM], mover: [0, 1], kind, bend: 1, layers, into })

export const cup = {
  id: 'cup',
  name: say('Cup', 'Vaso'),
  kana: 'コップ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'cup',
      name: say('Cup', 'Vaso'),
      kanji: '杯',
      tone: 'cup',
      paper: say(`${SIDE_CM} cm square, blue on one side`, `cuadrado de ${SIDE_CM} cm, azul de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say('Fold the right corner across to the left edge, so the top of the flap lies level.', 'Dobla la esquina derecha hacia el borde izquierdo, de modo que la parte de arriba de la solapa quede a nivel.'),
          actions: [across(1)],
        },
        {
          text: say('Fold the left corner across to the right edge the same way.', 'Dobla la esquina izquierda hacia el borde derecho de la misma manera.'),
          actions: [across(-1)],
        },
        {
          text: say('Fold the front top corner down and tuck it into the pocket of the flap in front.', 'Dobla la esquina de arriba de adelante hacia abajo y métela en el bolsillo de la solapa de adelante.'),
          actions: [top('valley', 'top', 1)],
        },
        {
          text: say('Fold the back top corner down behind.', 'Dobla la esquina de arriba de atrás hacia abajo por detrás.'),
          actions: [top('mountain', 'bottom')],
        },
      ],
    },
  ],
}
