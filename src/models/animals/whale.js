import { add, polar } from '../../geometry.js'
import { arc, cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TIP = [1, 0]
const HEAD = 1 - Math.SQRT2
const TAIL = 0.4

const face = [arc([-0.25, 0.3], 0.035, 0, 360, 10), [[HEAD, 0.12], [-0.3, 0.1], [-0.18, 0.12]]]

export const whale = {
  id: 'whale',
  name: 'Whale',
  kana: 'くじら',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'body',
      name: 'Body',
      kanji: '体',
      tone: 'whale',
      paper: `${SIDE_CM} cm square, blue on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the two edges at the right corner in to the middle line.',
          actions: [
            { from: TIP, to: add(TIP, polar(157.5)), mover: [0.5, 0.5], kind: 'valley', bend: -1 },
            { from: TIP, to: add(TIP, polar(202.5)), mover: [0.5, -0.5], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: 'Fold in half, bottom up.',
          actions: [HALVE_UP],
        },
        {
          text: 'Fold the left point behind along an upright crease through the top corner.',
          actions: [{ from: [HEAD, -1], to: [HEAD, 1], mover: [-1, 0], kind: 'mountain', bend: 1 }],
        },
        {
          text: `Fold the tip up to make the tail. The crease starts ${cm(1 - TAIL)} cm from the tip on the bottom edge and slants up to the right.`,
          actions: [{ from: [TAIL, 0], to: [TAIL + 1, 1], mover: TIP, kind: 'valley', bend: -1 }],
        },
        {
          text: 'Draw an eye and a smile.',
          actions: [{ kind: 'draw', strokes: face }],
        },
      ],
    },
  ],
}
