import { say } from '../../i18n.js'
import { cm, DIAMOND, HALVE_DOWN, SIDE_CM } from '../shapes.js'

const KEEL = -0.5
const MAST = 0.35
const DEPTH = 0.2

export const sailboat = {
  id: 'sailboat',
  name: say('Sailboat', 'Velero'),
  kana: 'ヨット',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'sail',
      name: say('Sail', 'Vela'),
      kanji: '帆',
      tone: 'sail',
      paper: say(`${SIDE_CM} cm square, red on one side`, `cuadrado de ${SIDE_CM} cm, rojo de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the left corner over to the right corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina izquierda hacia la esquina derecha.'),
          actions: [{ from: [0, -1], to: [0, 1], mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
      ],
    },
    {
      id: 'hull',
      name: say('Hull', 'Casco'),
      kanji: '船体',
      tone: 'wood',
      paper: say(`${SIDE_CM} cm square, brown on one side`, `cuadrado de ${SIDE_CM} cm, marrón de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the top corner down to the bottom corner.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de arriba hacia la esquina de abajo.'),
          actions: [HALVE_DOWN],
        },
        {
          text: say(`Fold the bottom point behind, ${cm(1 + KEEL)} cm up from the tip.`, `Dobla la punta de abajo hacia atrás, a ${cm(1 + KEEL)} cm de la punta.`),
          actions: [{ from: [-1, KEEL], to: [1, KEEL], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'sail' },
    steps: [
      {
        text: say(`Glue the hull over the bottom ${cm(DEPTH)} cm of the sail, with the sail's fold standing upright a little left of the middle.`, `Pega el casco sobre los ${cm(DEPTH)} cm de abajo de la vela, con el pliegue de la vela parado un poco a la izquierda del medio.`),
        actions: [{ kind: 'join', part: 'hull', seat: [MAST, DEPTH - 1] }],
      },
    ],
  },
}
