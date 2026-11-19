import { say } from '../../i18n.js'
import { LONG, SIDE_CM } from '../shapes.js'

const HALF = LONG / 2

export const SQUARE = [[-LONG, -LONG], [LONG, -LONG], [LONG, LONG], [-LONG, LONG]]

const side = sign => ({ from: [sign * HALF, -LONG], to: [sign * HALF, 0], mover: [sign * LONG, -HALF], kind: 'valley', bend: sign })
const roof = sign => ({
  kind: 'squash',
  from: [sign * HALF, -LONG],
  to: [sign * HALF, 0],
  mover: [0, 0],
  diagonal: [[sign * HALF, 0], [0, -HALF]],
  bend: -sign,
})

export const houseSteps = [
  {
    text: say('Coloured side down. Fold the top edge down to the bottom edge.', 'Lado de color hacia abajo. Dobla el borde de arriba hacia el borde de abajo.'),
    actions: [{ from: [-LONG, 0], to: [LONG, 0], mover: [0, LONG], kind: 'valley', bend: -1 }],
  },
  {
    text: say('Fold in half from side to side and unfold, leaving a crease down the middle.', 'Dobla por la mitad de lado a lado y desdobla, dejando un pliegue en el medio.'),
    actions: [{ from: [0, -LONG], to: [0, 0], mover: [LONG, -HALF], kind: 'crease', bend: 1 }],
  },
  {
    text: say('Fold the left and right edges in to the middle crease.', 'Dobla los bordes izquierdo y derecho hacia el pliegue del medio.'),
    actions: [side(-1), side(1)],
  },
  {
    text: say('Lift the left flap, open its top and squash it flat into a triangle for the roof.', 'Levanta la solapa izquierda, ábrela por arriba y aplástala hasta formar un triángulo para el techo.'),
    actions: [roof(-1)],
  },
  {
    text: say('Squash the right flap the same way.', 'Aplasta la solapa derecha de la misma manera.'),
    actions: [roof(1)],
  },
]

export const house = {
  id: 'house',
  name: say('House', 'Casa'),
  kana: 'いえ',
  sheet: SQUARE,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'house',
      name: say('House', 'Casa'),
      kanji: '家',
      tone: 'roof',
      paper: say(`${SIDE_CM} cm square, red on one side`, `cuadrado de ${SIDE_CM} cm, rojo de un lado`),
      steps: houseSteps,
    },
  ],
}
