import { say } from '../../i18n.js'
import { arc, cm, DIAMOND, HALVE_DOWN, mirror, SIDE_CM } from '../shapes.js'

const EAR_TOP = [-0.55, 0]
const EAR_EDGE = [-0.8, -0.2]

const whole = strokes => [...strokes, ...strokes.map(stroke => stroke.map(mirror))]

const face = [
  ...whole([arc([-0.22, -0.2], 0.05, 0, 360, 10)]),
  [[-0.08, -0.5], [0.08, -0.5], [0, -0.62], [-0.08, -0.5]],
  [[0, -0.62], [0, -0.68]],
  [[0, -0.68], ...arc([-0.07, -0.68], 0.07, 0, -180, 6)],
  [[0, -0.68], ...arc([0.07, -0.68], 0.07, 180, 360, 6)],
  arc([0.22, -0.2], 0.11, 0, 360, 12),
]

export const head = {
  id: 'face',
  name: say('Face', 'Cara'),
  kanji: '顔',
  tone: 'dog',
  paper: say(`${SIDE_CM} cm square, brown on one side`, `cuadrado de ${SIDE_CM} cm, marrón de un lado`),
  steps: [
    {
      text: say('White side up, a corner toward you. Fold the top corner down to the bottom corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de arriba hacia la esquina de abajo.'),
      actions: [HALVE_DOWN],
    },
    {
      text: say(`Fold the left corner down to make a floppy ear. The crease runs from ${cm(-EAR_TOP[0])} cm left of the middle of the top edge to a spot ${cm(-EAR_EDGE[1])} cm down the left edge.`, `Dobla la esquina izquierda hacia abajo para hacer una oreja caída. El pliegue va desde un punto a ${cm(-EAR_TOP[0])} cm a la izquierda de la mitad del borde de arriba hasta un punto a ${cm(-EAR_EDGE[1])} cm hacia abajo por el borde izquierdo.`),
      actions: [{ from: EAR_TOP, to: EAR_EDGE, mover: [-1, 0], kind: 'valley', bend: 1 }],
    },
    {
      text: say('Repeat on the right. The two ears should hang level.', 'Repite a la derecha. Las dos orejas deben caer a la misma altura.'),
      actions: [{ from: mirror(EAR_TOP), to: mirror(EAR_EDGE), mover: [1, 0], kind: 'valley', bend: -1 }],
    },
    {
      text: say('Draw the face: two eyes, a big nose, a smile and a patch around one eye.', 'Dibuja la cara: dos ojos, una nariz grande, una sonrisa y una mancha alrededor de un ojo.'),
      actions: [{ kind: 'draw', strokes: face }],
    },
  ],
}

export const dogFace = {
  id: 'dog-face',
  name: say('Dog face', 'Cara de perro'),
  kana: 'いぬ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [head],
}
