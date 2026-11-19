import { length, polar, sub } from '../../geometry.js'
import { say } from '../../i18n.js'
import { arc, CENTRE, cm, DIAMOND, edgeReach, HALVE_UP, mirror, SIDE_CM } from '../shapes.js'

const BROW = 0.7
const EAR_ANGLE = 40
const cheek = polar(EAR_ANGLE, edgeReach(EAR_ANGLE))

const whole = strokes => [...strokes, ...strokes.map(stroke => stroke.map(mirror))]

const face = [
  ...whole([arc([0.17, 0.3], 0.04, 0, 360, 10)]),
  [[-0.04, 0.17], [0.04, 0.17], [0, 0.12], [-0.04, 0.17]],
  [[0, 0.12], [0, 0.08]],
  [[0, 0.08], ...arc([-0.05, 0.08], 0.05, 0, -150, 6)],
  [[0, 0.08], ...arc([0.05, 0.08], 0.05, 180, 330, 6)],
  ...whole([[[0.14, 0.14], [0.4, 0.17]], [[0.14, 0.11], [0.4, 0.09]]]),
]

export const rabbit = {
  id: 'rabbit-face',
  name: say('Rabbit face', 'Cara de conejo'),
  kana: 'うさぎ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'face',
      name: say('Face', 'Cara'),
      kanji: '顔',
      tone: 'rabbit',
      paper: say(`${SIDE_CM} cm square, grey on one side`, `cuadrado de ${SIDE_CM} cm, gris de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say(`Fold the top point behind. The crease sits ${cm(1 - BROW)} cm below the tip.`, `Dobla la punta de arriba hacia atrás. El pliegue queda a ${cm(1 - BROW)} cm de la punta.`),
          actions: [{ from: [-1, BROW], to: [1, BROW], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say(`Fold the right corner up to make a long ear. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], cheek)))} cm up the right edge.`, `Dobla la esquina derecha hacia arriba para hacer una oreja larga. El pliegue va desde la mitad del borde de abajo hasta un punto a ${cm(length(sub([1, 0], cheek)))} cm hacia arriba por el borde derecho.`),
          actions: [{ from: CENTRE, to: cheek, mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: say('Repeat on the left. The two ears should stand level.', 'Repite a la izquierda. Las dos orejas deben quedar paradas a la misma altura.'),
          actions: [{ from: CENTRE, to: mirror(cheek), mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: say('Draw the face: round eyes, a little nose, a mouth and whiskers.', 'Dibuja la cara: ojos redondos, una nariz pequeña, una boca y bigotes.'),
          actions: [{ kind: 'draw', strokes: face }],
        },
      ],
    },
  ],
}
