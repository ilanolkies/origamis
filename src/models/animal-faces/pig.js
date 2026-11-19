import { say } from '../../i18n.js'
import { arc, cm, DIAMOND, HALVE_DOWN, mirror, SIDE_CM } from '../shapes.js'

const EAR_TOP = [-0.6, 0]
const EAR_EDGE = [-0.82, -0.18]
const CHIN = -0.7

const whole = strokes => [...strokes, ...strokes.map(stroke => stroke.map(mirror))]

const face = [
  ...whole([arc([-0.2, -0.17], 0.04, 0, 360, 10)]),
  arc([0, -0.45], 0.2, 0, 360, 16),
  ...whole([arc([0.07, -0.45], 0.03, 0, 360, 8)]),
]

export const pig = {
  id: 'pig-face',
  name: say('Pig face', 'Cara de cerdo'),
  kana: 'ぶた',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'face',
      name: say('Face', 'Cara'),
      kanji: '顔',
      tone: 'pig',
      paper: say(`${SIDE_CM} cm square, pink on one side`, `cuadrado de ${SIDE_CM} cm, rosa de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the top corner down to the bottom corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de arriba hacia la esquina de abajo.'),
          actions: [HALVE_DOWN],
        },
        {
          text: say(`Fold the bottom point behind. The crease sits ${cm(1 + CHIN)} cm above the tip.`, `Dobla la punta de abajo hacia atrás. El pliegue queda a ${cm(1 + CHIN)} cm por encima de la punta.`),
          actions: [{ from: [-1, CHIN], to: [1, CHIN], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say(`Fold the left corner down to make a small ear. The crease runs from ${cm(-EAR_TOP[0])} cm left of the middle of the top edge to a spot ${cm(-EAR_EDGE[1])} cm down the left edge.`, `Dobla la esquina izquierda hacia abajo para hacer una oreja pequeña. El pliegue va desde un punto a ${cm(-EAR_TOP[0])} cm a la izquierda de la mitad del borde de arriba hasta un punto a ${cm(-EAR_EDGE[1])} cm hacia abajo por el borde izquierdo.`),
          actions: [{ from: EAR_TOP, to: EAR_EDGE, mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: say('Repeat on the right. The two ears should hang level.', 'Repite a la derecha. Las dos orejas deben caer a la misma altura.'),
          actions: [{ from: mirror(EAR_TOP), to: mirror(EAR_EDGE), mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: say('Draw the face: two eyes and a round snout with two nostrils.', 'Dibuja la cara: dos ojos y un hocico redondo con dos fosas nasales.'),
          actions: [{ kind: 'draw', strokes: face }],
        },
      ],
    },
  ],
}
