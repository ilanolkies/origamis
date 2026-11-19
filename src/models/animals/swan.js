import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TIP = [1, 0]
const NECK = 0.2
const NECK_ANGLE = 47
const HEAD_ANGLE = 35
const TAIL = -0.55
const TAIL_ANGLE = 145

const neckTip = add([NECK, 0], polar(2 * NECK_ANGLE, 1 - NECK))
const throat = add(neckTip, polar(2 * NECK_ANGLE + 180, 0.2))

export const swan = {
  id: 'swan',
  name: say('Swan', 'Cisne'),
  kana: 'はくちょう',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'swan',
      name: say('Swan', 'Cisne'),
      kanji: '白鳥',
      tone: 'swan',
      paper: say(`${SIDE_CM} cm square, pale blue on one side`, `cuadrado de ${SIDE_CM} cm, celeste de un lado`),
      steps: [
        {
          text: say('Coloured side down, a corner to the right. Fold the bottom corner up to the top corner and unfold.', 'Lado de color hacia abajo, una esquina hacia la derecha. Dobla la esquina de abajo hacia la esquina de arriba y desdobla.'),
          actions: [{ ...HALVE_UP, kind: 'crease' }],
        },
        {
          text: say('Fold the two edges at the right corner in to the middle crease to make a kite.', 'Dobla los dos bordes de la esquina derecha hacia el pliegue del medio para hacer una cometa.'),
          actions: [
            { from: TIP, to: add(TIP, polar(157.5)), mover: [0.5, 0.5], kind: 'valley', bend: -1 },
            { from: TIP, to: add(TIP, polar(202.5)), mover: [0.5, -0.5], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Turn over, top to bottom.', 'Voltea el papel, de arriba hacia abajo.'),
          actions: [{ kind: 'turn', from: [0, 0], to: [1, 0] }],
        },
        {
          text: say('Fold the two edges at the right corner in to the middle again to narrow the kite.', 'Dobla de nuevo los dos bordes de la esquina derecha hacia el medio para estrechar la cometa.'),
          actions: [
            { from: TIP, to: add(TIP, polar(168.75)), mover: [0.3, 0.3], kind: 'valley', bend: -1 },
            { from: TIP, to: add(TIP, polar(191.25)), mover: [0.3, -0.3], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Fold the bottom half up along the middle crease.', 'Dobla la mitad de abajo hacia arriba por el pliegue del medio.'),
          actions: [HALVE_UP],
        },
        {
          text: say('Inside reverse fold the point up between the layers to make the neck.', 'Haz un pliegue invertido interior con la punta hacia arriba entre las capas para formar el cuello.'),
          actions: [{ kind: 'inside-reverse', from: [NECK, 0], to: add([NECK, 0], polar(NECK_ANGLE)), mover: TIP, bend: 1 }],
        },
        {
          text: say('Inside reverse fold the left point up between the layers to make the tail.', 'Haz un pliegue invertido interior con la punta izquierda hacia arriba entre las capas para formar la cola.'),
          actions: [{ kind: 'inside-reverse', from: [TAIL, 0], to: add([TAIL, 0], polar(TAIL_ANGLE)), mover: [-1, 0], bend: -1 }],
        },
        {
          text: say('Inside reverse fold the top of the neck down to make the head.', 'Haz un pliegue invertido interior con la parte de arriba del cuello hacia abajo para formar la cabeza.'),
          actions: [{ kind: 'inside-reverse', from: throat, to: add(throat, polar(HEAD_ANGLE)), mover: neckTip, bend: -1 }],
        },
      ],
    },
  ],
}
