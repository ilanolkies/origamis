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
  name: 'Cicada',
  kana: 'せみ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'body',
      name: 'Body',
      kanji: '蝉',
      tone: 'cicada',
      paper: `${SIDE_CM} cm square, green on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the bottom corner up to the top corner.',
          actions: [HALVE_UP],
        },
        {
          text: 'Fold the left and right corners up to the top corner.',
          actions: [sideUp(-1), sideUp(1)],
        },
        {
          text: 'Fold the two flaps down and out at a slant to make the wings, their points past the bottom.',
          actions: [wing(-1), wing(1)],
        },
        {
          text: `Fold the top layer of the top corner down, ${cm(1 - HEAD)} cm from the tip.`,
          actions: [flap(HEAD)],
        },
        {
          text: `Fold the next layer down too, ${cm(1 - BAND)} cm from its tip, leaving a band above the first.`,
          actions: [flap(BAND)],
        },
        {
          text: 'Fold the sides behind to narrow the body.',
          actions: [behind(-1), behind(1)],
        },
        {
          text: 'Draw two eyes on the head.',
          actions: [{ kind: 'draw', strokes: eyes }],
        },
      ],
    },
  ],
}
