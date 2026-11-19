import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { arc, cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TIP = [1, 0]
const HEAD = 1 - Math.SQRT2
const TAIL = 0.4

const face = [arc([-0.25, 0.3], 0.035, 0, 360, 10), [[HEAD, 0.12], [-0.3, 0.1], [-0.18, 0.12]]]

export const whale = {
  id: 'whale',
  name: say('Whale', 'Ballena'),
  kana: 'くじら',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'body',
      name: say('Body', 'Cuerpo'),
      kanji: '体',
      tone: 'whale',
      paper: say(`${SIDE_CM} cm square, blue on one side`, `cuadrado de ${SIDE_CM} cm, azul de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the bottom corner up to the top corner and unfold, leaving a crease across the middle.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba y desdobla, dejando un pliegue en el medio.'),
          actions: [{ ...HALVE_UP, kind: 'crease' }],
        },
        {
          text: say('Fold the two edges at the right corner in to the middle crease.', 'Dobla los dos bordes de la esquina derecha hacia el pliegue del medio.'),
          actions: [
            { from: TIP, to: add(TIP, polar(157.5)), mover: [0.5, 0.5], kind: 'valley', bend: -1 },
            { from: TIP, to: add(TIP, polar(202.5)), mover: [0.5, -0.5], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Fold in half again along the middle crease, bottom up.', 'Dobla otra vez por la mitad por el pliegue del medio, de abajo hacia arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say('Fold the left point behind along an upright crease through the top corner.', 'Dobla la punta izquierda hacia atrás por un pliegue vertical que pasa por la esquina de arriba.'),
          actions: [{ from: [HEAD, -1], to: [HEAD, 1], mover: [-1, 0], kind: 'mountain', bend: 1 }],
        },
        {
          text: say(`Fold the tip up to make the tail. The crease starts ${cm(1 - TAIL)} cm from the tip on the bottom edge and slants up to the right.`, `Dobla la punta hacia arriba para hacer la cola. El pliegue empieza a ${cm(1 - TAIL)} cm de la punta en el borde de abajo y sube inclinado hacia la derecha.`),
          actions: [{ from: [TAIL, 0], to: [TAIL + 1, 1], mover: TIP, kind: 'valley', bend: -1 }],
        },
        {
          text: say('Draw an eye and a smile.', 'Dibuja un ojo y una sonrisa.'),
          actions: [{ kind: 'draw', strokes: face }],
        },
      ],
    },
  ],
}
