import { add, apply, polar, reflection, sub } from '../../geometry.js'
import { say } from '../../i18n.js'
import { DIAMOND, SIDE_CM } from '../shapes.js'

const HINGE = Math.SQRT1_2 - 1
const BOTTOM = [0, -1]
const ROOT = -0.32
const LEG_ANGLE = -26.5
const HEAD = 0.15
const HEAD_TURN = 70

export const PRELIMINARY = { kind: 'collapse', base: 'preliminary' }
export const PETAL = { kind: 'petal', from: [HINGE, HINGE], to: [-HINGE, HINGE], mover: BOTTOM }
export const UPRIGHT = { kind: 'turn', from: [0, 0], to: [0, 1] }

export const WING = { kind: 'valley', from: [-HINGE, HINGE], to: [HINGE, HINGE], mover: [0, 0.3], bend: 0.4, layers: 'top' }

const angleOf = ([x, y]) => (Math.atan2(y, x) * 180) / Math.PI

const leg = side => {
  const from = [0, ROOT]
  const to = add(from, polar(side > 0 ? LEG_ANGLE : 180 - LEG_ANGLE))
  return { kind: 'inside-reverse', from, to, mover: [side * 0.02, -0.9], bend: side }
}

const neck = leg(1)
const neckTip = apply(reflection(neck.from, neck.to), BOTTOM)
const neckAngle = angleOf(sub(neckTip, neck.from))
const throat = add(neckTip, polar(neckAngle + 180, HEAD))

export const flappingBird = {
  id: 'flapping-bird',
  name: say('Flapping bird', 'Pájaro aleteando'),
  kana: 'はばたくとり',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'bird',
      name: say('Bird', 'Pájaro'),
      kanji: '鳥',
      tone: 'bird',
      paper: say(`${SIDE_CM} cm square, coloured on one side`, `cuadrado de ${SIDE_CM} cm, de color de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Crease both diagonals as valleys and both middles as mountains, then collapse into a preliminary base with the four corners at the bottom.', 'Lado blanco hacia arriba, una esquina hacia ti. Marca las dos diagonales como valles y las dos mitades como montañas, y luego pliega hasta formar una base preliminar con las cuatro esquinas abajo.'),
          actions: [PRELIMINARY],
        },
        {
          text: say('Fold the lower edges of the top layer to the middle, fold the top down over them and unfold. Lift the bottom corner of the top layer up along the crease and press the sides in: a petal fold.', 'Dobla los bordes de abajo de la capa de arriba hacia el medio, dobla la punta de arriba hacia abajo sobre ellos y desdobla. Levanta la esquina de abajo de la capa de arriba por el pliegue y presiona los lados hacia adentro: un pliegue pétalo.'),
          actions: [PETAL],
        },
        {
          text: say('Turn over, side to side.', 'Voltea el papel, de lado a lado.'),
          actions: [UPRIGHT],
        },
        {
          text: say('Petal fold this side the same way to finish the bird base.', 'Haz un pliegue pétalo en este lado de la misma manera para terminar la base de pájaro.'),
          actions: [PETAL],
        },
        {
          text: say('Inside reverse fold the right lower point up and out between the layers to make the neck.', 'Haz un pliegue invertido interior: lleva la punta inferior derecha hacia arriba y hacia afuera entre las capas para formar el cuello.'),
          actions: [neck],
        },
        {
          text: say('Inside reverse fold the left lower point up the same way to make the tail.', 'Haz un pliegue invertido interior con la punta inferior izquierda hacia arriba de la misma manera para formar la cola.'),
          actions: [leg(-1)],
        },
        {
          text: say('Inside reverse fold the tip of the neck down to make the head.', 'Haz un pliegue invertido interior con la punta del cuello hacia abajo para formar la cabeza.'),
          actions: [{ kind: 'inside-reverse', from: throat, to: add(throat, polar(neckAngle - HEAD_TURN)), mover: neckTip, bend: -1 }],
        },
        {
          text: say('Fold the front wing down along the top of the body and leave the back wing up, as if mid-flap.', 'Dobla el ala de adelante hacia abajo por el borde de arriba del cuerpo y deja el ala de atrás arriba, como en pleno aleteo.'),
          actions: [WING],
        },
      ],
    },
  ],
}
