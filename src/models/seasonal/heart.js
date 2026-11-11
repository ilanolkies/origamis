import { add, apply, reflection, scale, sub, unit } from '../../geometry.js'
import { cm, DIAMOND, HALVE_DOWN, mirror, SIDE_CM } from '../shapes.js'

const LOBE = -0.25
const NOTCH = -0.14
const TIP_CUT = 0.3
const SIDE_CUT = 0.12

const CORNER = [-0.5, -0.5]
const HINGE = [0, LOBE]
const TIP = apply(reflection(CORNER, HINGE), [0, -1])

const along = (from, to, distance) => add(from, scale(unit(sub(to, from)), distance))
const sided = (side, p) => (side < 0 ? p : mirror(p))

const sideDown = side => ({ from: [0, 0], to: [side, -1], mover: [side, 0], kind: 'valley', bend: -side })
const lobe = side => ({
  from: sided(side, CORNER),
  to: HINGE,
  mover: [side * 0.02, -0.97],
  kind: 'valley',
  bend: side,
  layers: 'top',
})
const behind = (side, from, to, mover, layers) => ({
  from: sided(side, from),
  to: sided(side, to),
  mover: sided(side, mover),
  kind: 'mountain',
  bend: side,
  layers,
})
const tip = side => behind(side, along(TIP, CORNER, TIP_CUT), along(TIP, HINGE, TIP_CUT), TIP, 'top')
const corner = side => behind(side, along(CORNER, [0, -1], SIDE_CUT), along(CORNER, TIP, SIDE_CUT), CORNER)

export const heart = {
  id: 'heart',
  name: 'Heart',
  kana: 'ハート',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'heart',
      name: 'Heart',
      kanji: '心',
      tone: 'heart',
      paper: `${SIDE_CM} cm square, red on one side`,
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
          text: 'Fold the bottom points of the two flaps up and out past the top to make the lobes.',
          actions: [lobe(-1), lobe(1)],
        },
        {
          text: `Fold the top corner behind, ${cm(-NOTCH)} cm down, leaving the lobes in front.`,
          actions: [{ from: [-1, NOTCH], to: [1, NOTCH], mover: [0, 0], kind: 'mountain', bend: 1, layers: 'bottom' }],
        },
        {
          text: 'Fold the tips of the lobes and the two side corners behind to round the heart.',
          actions: [tip(-1), tip(1), corner(-1), corner(1)],
        },
      ],
    },
  ],
}
