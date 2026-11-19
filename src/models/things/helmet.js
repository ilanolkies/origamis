import { say } from '../../i18n.js'
import { cm, DIAMOND, HALVE_DOWN, SIDE_CM } from '../shapes.js'

const BRIM = -0.6
const RIM = -0.5

const sideDown = side => ({ from: [0, 0], to: [side, -1], mover: [side, 0], kind: 'valley', bend: -side })
const horn = side => ({ from: [0, RIM], to: [side * 0.15, -0.15], mover: [side * 0.02, -0.06], kind: 'valley', bend: side, layers: 'top' })
const across = (height, mover, kind, layers, into) => ({ from: [-1, height], to: [1, height], mover, kind, bend: 1, layers, into })

export const helmet = {
  id: 'helmet',
  name: say('Samurai helmet', 'Casco de samurái'),
  kana: 'かぶと',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'helmet',
      name: say('Helmet', 'Casco'),
      kanji: '兜',
      tone: 'helmet',
      paper: say(`${SIDE_CM} cm square, purple on one side`, `cuadrado de ${SIDE_CM} cm, violeta de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the top corner down to the bottom corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de arriba hacia la esquina de abajo.'),
          actions: [HALVE_DOWN],
        },
        {
          text: say('Fold the left and right corners down to the bottom corner.', 'Dobla las esquinas izquierda y derecha hacia la esquina de abajo.'),
          actions: [sideDown(-1), sideDown(1)],
        },
        {
          text: say('Fold the bottom points of both flaps up to the top corner.', 'Dobla las puntas de abajo de las dos solapas hacia arriba hasta la esquina de arriba.'),
          actions: [across(RIM, [0, -1], 'valley', 4)],
        },
        {
          text: say('Fold the two points out to the sides at a slant to make the horns.', 'Dobla las dos puntas hacia los lados en diagonal para hacer los cuernos.'),
          actions: [horn(-1), horn(1)],
        },
        {
          text: say(`Fold the top layer of the bottom corner up, ${cm(1 + BRIM)} cm from the tip.`, `Dobla hacia arriba la capa de arriba de la esquina de abajo, a ${cm(1 + BRIM)} cm de la punta.`),
          actions: [across(BRIM, [0, -1], 'valley', 'top')],
        },
        {
          text: say('Fold it up again along the bottom edge of the horns to make the brim.', 'Dóblala hacia arriba otra vez por el borde de abajo de los cuernos para hacer el ala.'),
          actions: [across(RIM, [0, BRIM], 'valley', 'top')],
        },
        {
          text: say('Fold the last bottom corner up and tuck it inside the helmet.', 'Dobla la última esquina de abajo hacia arriba y métela dentro del casco.'),
          actions: [across(RIM, [0, -1], 'valley', 'bottom', 'inside')],
        },
      ],
    },
  ],
}
