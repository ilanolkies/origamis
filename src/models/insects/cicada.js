import { say } from '../../i18n.js'
import { arc, cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const WING = 0.4
const HEAD = 0.65
const BAND = 0.75

const sideUp = side => ({ from: [0, 0], to: [side, 1], mover: [side, 0], kind: 'valley', bend: side })
const wing = side => ({ from: [side * 0.5, 0.5], to: [0, WING], mover: [0, 1], kind: 'valley', bend: -side, layers: 'top' })
const flap = height => ({ from: [-1, height], to: [1, height], mover: [0, 1], kind: 'valley', bend: 1, layers: 'top' })
const behind = side => ({ from: [side * 0.2, 0.8], to: [side * 0.42, -0.1], mover: [side * 0.5, 0.5], kind: 'mountain', bend: side })

const eyes = [arc([-0.16, 0.6], 0.03, 0, 360, 10), arc([0.16, 0.6], 0.03, 0, 360, 10)]

export const cicada = {
  id: 'cicada',
  name: say('Cicada', 'Cigarra'),
  kana: 'せみ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'body',
      name: say('Body', 'Cuerpo'),
      kanji: '蝉',
      tone: 'cicada',
      paper: say(`${SIDE_CM} cm square, green on one side`, `cuadrado de ${SIDE_CM} cm, verde de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say('Fold the left and right corners up to the top corner.', 'Dobla las esquinas izquierda y derecha hacia la esquina de arriba.'),
          actions: [sideUp(-1), sideUp(1)],
        },
        {
          text: say('Fold the two flaps down and out at a slant to make the wings, their points past the bottom.', 'Dobla las dos solapas hacia abajo y hacia afuera en diagonal para hacer las alas, con las puntas sobresaliendo por abajo.'),
          actions: [wing(-1), wing(1)],
        },
        {
          text: say(`Fold the top layer of the top corner down, ${cm(1 - HEAD)} cm from the tip.`, `Dobla hacia abajo la capa de arriba de la esquina de arriba, a ${cm(1 - HEAD)} cm de la punta.`),
          actions: [flap(HEAD)],
        },
        {
          text: say(`Fold the next layer down too, ${cm(1 - BAND)} cm from its tip, leaving a band above the first.`, `Dobla también la capa siguiente hacia abajo, a ${cm(1 - BAND)} cm de su punta, dejando una banda por encima de la primera.`),
          actions: [flap(BAND)],
        },
        {
          text: say('Fold the sides behind to narrow the body.', 'Dobla los lados hacia atrás para estrechar el cuerpo.'),
          actions: [behind(-1), behind(1)],
        },
        {
          text: say('Draw two eyes on the head.', 'Dibuja dos ojos en la cabeza.'),
          actions: [{ kind: 'draw', strokes: eyes }],
        },
      ],
    },
  ],
}
