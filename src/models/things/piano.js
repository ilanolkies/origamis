import { say } from '../../i18n.js'
import { LONG, SIDE_CM } from '../shapes.js'
import { houseSteps, SQUARE } from './house.js'

const HALF = LONG / 2
const KEYS = -LONG * 0.75
const KEY = LONG / 8

const behind = sign => ({ from: [sign * HALF, -LONG], to: [sign * HALF, 0], mover: [sign * LONG, -HALF], kind: 'mountain', bend: sign })

const whiteKeys = Array.from({ length: 7 }, (_, i) => [[-HALF + (i + 1) * KEY, KEYS], [-HALF + (i + 1) * KEY, -HALF]])
const BLACK_BOTTOM = -HALF + 0.6 * (KEYS + HALF)
const blackKey = x =>
  [-1, -0.5, 0, 0.5, 1].flatMap((offset, i) => {
    const at = x + offset * KEY * 0.25
    return i % 2 ? [[at, BLACK_BOTTOM], [at, -HALF]] : [[at, -HALF], [at, BLACK_BOTTOM]]
  })
const blackKeys = [1, 2, 4, 5, 6].map(i => blackKey(-HALF + i * KEY))

export const piano = {
  id: 'piano',
  name: say('Piano', 'Piano'),
  kana: 'ピアノ',
  sheet: SQUARE,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'piano',
      name: say('Piano', 'Piano'),
      kanji: '洋琴',
      tone: 'piano',
      paper: say(`${SIDE_CM} cm square, black on one side`, `cuadrado de ${SIDE_CM} cm, negro de un lado`),
      steps: [
        ...houseSteps,
        {
          text: say('Fold the left and right sides behind along the edges of the roof.', 'Dobla los lados izquierdo y derecho hacia atrás por los bordes del techo.'),
          actions: [behind(-1), behind(1)],
        },
        {
          text: say('Fold the bottom edge behind, leaving a white strip for the keys.', 'Dobla el borde de abajo hacia atrás, dejando una tira blanca para las teclas.'),
          actions: [{ from: [-LONG, KEYS], to: [LONG, KEYS], mover: [0, -LONG], kind: 'mountain', bend: 1 }],
        },
        {
          text: say('Draw the keys.', 'Dibuja las teclas.'),
          actions: [{ kind: 'draw', strokes: [...whiteKeys, ...blackKeys] }],
        },
      ],
    },
  ],
}
