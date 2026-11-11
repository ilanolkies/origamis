import { cm, DIAMOND, HALVE_DOWN, SIDE_CM } from '../shapes.js'

const BRIM = -0.6
const RIM = -0.5

const sideDown = side => ({ from: [0, 0], to: [side, -1], mover: [side, 0], kind: 'valley', bend: -side })
const horn = side => ({ from: [0, RIM], to: [side * 0.15, -0.15], mover: [side * 0.02, -0.06], kind: 'valley', bend: side, layers: 'top' })
const across = (height, mover, kind, layers, into) => ({ from: [-1, height], to: [1, height], mover, kind, bend: 1, layers, into })

export const helmet = {
  id: 'helmet',
  name: 'Samurai helmet',
  kana: 'かぶと',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'helmet',
      name: 'Helmet',
      kanji: '兜',
      tone: 'helmet',
      paper: `${SIDE_CM} cm square, purple on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the top corner down to the bottom corner.',
          actions: [HALVE_DOWN],
        },
        {
          text: 'Fold the left and right corners down to the bottom corner.',
          actions: [sideDown(-1), sideDown(1)],
        },
        {
          text: 'Fold the bottom points of both flaps up to the top corner.',
          actions: [across(RIM, [0, -1], 'valley', 4)],
        },
        {
          text: 'Fold the two points out to the sides at a slant to make the horns.',
          actions: [horn(-1), horn(1)],
        },
        {
          text: `Fold the top layer of the bottom corner up, ${cm(1 + BRIM)} cm from the tip.`,
          actions: [across(BRIM, [0, -1], 'valley', 'top')],
        },
        {
          text: 'Fold it up again along the bottom edge of the horns to make the brim.',
          actions: [across(RIM, [0, BRIM], 'valley', 'top')],
        },
        {
          text: 'Fold the last bottom corner up and tuck it inside the helmet.',
          actions: [across(RIM, [0, -1], 'valley', 'bottom', 'inside')],
        },
      ],
    },
  ],
}
