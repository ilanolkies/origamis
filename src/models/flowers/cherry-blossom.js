import { add, length, polar, sub } from '../../geometry.js'
import { say } from '../../i18n.js'
import { arc, cm, DIAMOND, SIDE_CM } from '../shapes.js'

const PETALS = 5
const TURN = 360 / PETALS
const BOTTOM = [0, -1]
const SPREAD = 90 - TURN / 2
const ROUND = 0.12
const NOTCH = 0.8
const CENTRE = [0, 0]

const reach = 2 / (Math.cos((SPREAD * Math.PI) / 180) + Math.sin((SPREAD * Math.PI) / 180))
const SHOULDER = add(BOTTOM, polar(SPREAD, reach))
const shoulderDrop = length(sub([1, 0], SHOULDER))
const INWARD = (180 + SPREAD + 135) / 2

const round = (corner, inward, bend) => {
  const from = add(corner, polar(inward, ROUND))
  return { from, to: add(from, polar(inward + 90)), mover: corner, kind: 'mountain', bend }
}

const petalAt = k => ({ seat: polar(90 + k * TURN), rotate: k * TURN })

const middle = [
  arc(CENTRE, 0.14, 0, 360, 12),
  ...Array.from({ length: PETALS }, (_, k) => {
    const angle = 90 + k * TURN
    return [polar(angle, 0.14), polar(angle, 0.42), ...arc(polar(angle, 0.45), 0.03, 0, 360, 6)]
  }),
]

export const cherryBlossom = {
  id: 'cherry-blossom',
  name: say('Cherry blossom', 'Flor de cerezo'),
  kana: 'さくら',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'petal',
      name: say('Petal', 'Pétalo'),
      kanji: '花びら',
      tone: 'petal',
      copies: PETALS,
      paper: say(`${PETALS} squares of ${SIDE_CM} cm, pink on one side`, `${PETALS} cuadrados de ${SIDE_CM} cm, rosa de un lado`),
      steps: [
        {
          text: say(`Fold all ${PETALS} squares the same way. White side up, a corner toward you. Fold the two lower edges in along creases from the bottom corner to spots ${cm(shoulderDrop)} cm above the side corners.`, `Dobla los ${PETALS} cuadrados de la misma manera. Lado blanco hacia arriba, una esquina hacia ti. Dobla los dos bordes de abajo por pliegues que van desde la esquina de abajo hasta puntos a ${cm(shoulderDrop)} cm por encima de las esquinas laterales.`),
          actions: [
            { from: BOTTOM, to: add(BOTTOM, polar(SPREAD)), mover: [1, 0], kind: 'valley', bend: -1 },
            { from: BOTTOM, to: add(BOTTOM, polar(180 - SPREAD)), mover: [-1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Turn the paper over.', 'Voltea el papel.'),
          actions: [{ kind: 'turn' }],
        },
        {
          text: say(`Fold the top tip down ${cm(1 - NOTCH)} cm: the white tip is the notch of the petal.`, `Dobla la punta de arriba hacia abajo ${cm(1 - NOTCH)} cm: la punta blanca es la muesca del pétalo.`),
          actions: [{ from: [-1, NOTCH], to: [1, NOTCH], mover: [0, 1], kind: 'valley', bend: -1 }],
        },
        {
          text: say('Fold the two side corners behind a little to round the petal.', 'Dobla un poco las dos esquinas laterales hacia atrás para redondear el pétalo.'),
          actions: [round(SHOULDER, INWARD, 1), round([-SHOULDER[0], SHOULDER[1]], 180 - INWARD, -1)],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'petal', ...petalAt(0) },
    steps: [
      {
        text: say(`Glue the other ${PETALS - 1} petals around the first, their bottom points meeting in the middle, each turned a fifth of a turn from the last.`, `Pega los otros ${PETALS - 1} pétalos alrededor del primero, con las puntas de abajo juntas en el medio, cada uno girado un quinto de vuelta respecto del anterior.`),
        actions: Array.from({ length: PETALS - 1 }, (_, k) => ({ kind: 'join', part: 'petal', ...petalAt(k + 1) })),
      },
      {
        text: say('Draw the centre of the flower: a small circle with five stamens.', 'Dibuja el centro de la flor: un círculo pequeño con cinco estambres.'),
        actions: [{ kind: 'draw', strokes: middle }],
      },
    ],
  },
}
