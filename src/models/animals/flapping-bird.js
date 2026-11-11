import { add, apply, polar, reflection, sub } from '../../geometry.js'
import { DIAMOND, SIDE_CM } from '../shapes.js'

const HINGE = Math.SQRT1_2 - 1
const BOTTOM = [0, -1]
const ROOT = -0.32
const LEG_ANGLE = -26.5
const HEAD = 0.15
const HEAD_TURN = 70

export const PRELIMINARY = { kind: 'collapse', base: 'preliminary' }
export const PETAL = { kind: 'petal', from: [HINGE, HINGE], to: [-HINGE, HINGE], mover: BOTTOM }
export const UPRIGHT = { kind: 'turn', from: [0, 0], to: [0, 1] }

export const WING = { kind: 'valley', from: [-HINGE, HINGE], to: [HINGE, HINGE], mover: [0, 0.3], bend: 0.4, layers: 'top' }

const angleOf = ([x, y]) => (Math.atan2(y, x) * 180) / Math.PI

const leg = side => {
  const from = [0, ROOT]
  const to = add(from, polar(side > 0 ? LEG_ANGLE : 180 - LEG_ANGLE))
  return { kind: 'inside-reverse', from, to, mover: [side * 0.02, -0.9], bend: side }
}

const neck = leg(1)
const neckTip = apply(reflection(neck.from, neck.to), BOTTOM)
const neckAngle = angleOf(sub(neckTip, neck.from))
const throat = add(neckTip, polar(neckAngle + 180, HEAD))

export const flappingBird = {
  id: 'flapping-bird',
  name: 'Flapping bird',
  kana: 'はばたくとり',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'bird',
      name: 'Bird',
      kanji: '鳥',
      tone: 'bird',
      paper: `${SIDE_CM} cm square, coloured on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Crease both diagonals as valleys and both middles as mountains, then collapse into a preliminary base with the four corners at the bottom.',
          actions: [PRELIMINARY],
        },
        {
          text: 'Fold the lower edges of the top layer to the middle, fold the top down over them and unfold. Lift the bottom corner of the top layer up along the crease and press the sides in: a petal fold.',
          actions: [PETAL],
        },
        {
          text: 'Turn over, side to side.',
          actions: [UPRIGHT],
        },
        {
          text: 'Petal fold this side the same way to finish the bird base.',
          actions: [PETAL],
        },
        {
          text: 'Inside reverse fold the right lower point up and out between the layers to make the neck.',
          actions: [neck],
        },
        {
          text: 'Inside reverse fold the left lower point up the same way to make the tail.',
          actions: [leg(-1)],
        },
        {
          text: 'Inside reverse fold the tip of the neck down to make the head.',
          actions: [{ kind: 'inside-reverse', from: throat, to: add(throat, polar(neckAngle - HEAD_TURN)), mover: neckTip, bend: -1 }],
        },
        {
          text: 'Fold the front wing down along the top of the body and leave the back wing up, as if mid-flap.',
          actions: [WING],
        },
      ],
    },
  ],
}
