import { length, polar, sub } from '../../geometry.js'
import { say } from '../../i18n.js'
import { CENTRE, cm, DIAMOND, edgeReach, HALVE_UP, mirror, SIDE_CM } from '../shapes.js'

const BROW = 0.5
const EAR_ANGLE = 28
const cheek = polar(EAR_ANGLE, edgeReach(EAR_ANGLE))

const whole = strokes => [...strokes, ...strokes.map(stroke => stroke.map(mirror))]

const face = [
  ...whole([[[0.06, 0.27], [0.19, 0.34]], [[0.06, 0.27], [0.17, 0.24]]]),
  [[-0.07, 0.15], [0.07, 0.15], [0, 0.06], [-0.07, 0.15]],
  ...whole([[[0.42, 0.14], [0.2, 0.1]], [[0.42, 0.06], [0.2, 0.06]]]),
]

export const fox = {
  id: 'fox-face',
  name: say('Fox face', 'Cara de zorro'),
  kana: 'きつね',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'face',
      name: say('Face', 'Cara'),
      kanji: '顔',
      tone: 'fox',
      paper: say(`${SIDE_CM} cm square, orange on one side`, `cuadrado de ${SIDE_CM} cm, naranja de un lado`),
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
          text: say(`Fold the right corner up to make an ear. The crease runs from the middle of the bottom edge to a spot ${cm(length(sub([1, 0], cheek)))} cm up the right edge.`, `Dobla la esquina derecha hacia arriba para hacer una oreja. El pliegue va desde la mitad del borde de abajo hasta un punto a ${cm(length(sub([1, 0], cheek)))} cm hacia arriba por el borde derecho.`),
          actions: [{ from: CENTRE, to: cheek, mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: say('Repeat on the left. The two ears should stand level.', 'Repite a la izquierda. Las dos orejas deben quedar paradas a la misma altura.'),
          actions: [{ from: CENTRE, to: mirror(cheek), mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: say('Draw the face: narrow eyes, a small black nose and whiskers.', 'Dibuja la cara: ojos rasgados, una nariz negra pequeña y bigotes.'),
          actions: [{ kind: 'draw', strokes: face }],
        },
      ],
    },
  ],
}
