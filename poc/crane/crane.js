import { add, apply, polar, reflection, sub } from '../../src/geometry.js'
import { PETAL, PRELIMINARY, UPRIGHT } from '../../src/models/animals/flapping-bird.js'
import { DIAMOND } from '../../src/models/shapes.js'

const TIP = [0, -1]
const NARROW = 11.25
const ROOT = -0.38
const LEAN = -10
const HEAD = 0.16
const HEAD_TURN = 62
const SHOULDER = -0.15

const narrow = side => ({
  kind: 'valley',
  from: TIP,
  to: add(TIP, polar(90 - side * NARROW)),
  mover: [side * 0.13, -0.65],
  bend: side * 0.5,
  layers: 2,
})

const leg = side => {
  const from = [0, ROOT]
  const to = add(from, polar(side > 0 ? LEAN : 180 - LEAN))
  return { kind: 'inside-reverse', from, to, mover: [side * 0.008, -0.9], bend: side }
}

const neck = leg(1)
const neckTip = apply(reflection(neck.from, neck.to), TIP)
const neckAngle = (Math.atan2(...sub(neckTip, neck.from).reverse()) * 180) / Math.PI
const throat = add(neckTip, polar(neckAngle + 180, HEAD))
const head = { kind: 'inside-reverse', from: throat, to: add(throat, polar(neckAngle - HEAD_TURN)), mover: neckTip, bend: -1 }

const wing = (kind, layers) => ({ kind, from: [-1, SHOULDER], to: [1, SHOULDER], mover: [0.01, 0.3], bend: 0.4, layers })

export const WINGS_STEP = 10

export const crane = {
  id: 'crane',
  name: 'Crane',
  kana: 'おりづる',
  sheet: DIAMOND,
  steps: [
    { text: 'Collapse the square into a preliminary base, the four corners at the bottom.', actions: [PRELIMINARY] },
    { text: 'Petal fold: lift the bottom corner of the top layer up and press the sides in.', actions: [PETAL] },
    { text: 'Turn over.', actions: [UPRIGHT] },
    { text: 'Petal fold this side too. This is the bird base.', actions: [PETAL] },
    { text: 'Narrow the legs: fold both lower edges of the top layers to the middle.', actions: [narrow(-1), narrow(1)] },
    { text: 'Turn over.', actions: [UPRIGHT] },
    { text: 'Narrow the legs on this side the same way.', actions: [narrow(-1), narrow(1)] },
    { text: 'Inside reverse fold the right leg up between the wings: the neck.', actions: [neck] },
    { text: 'Inside reverse fold the left leg up the same way: the tail.', actions: [leg(-1)] },
    { text: 'Inside reverse fold the tip of the neck down: the head.', actions: [head] },
    { text: 'Fold both wings down.', actions: [wing('valley', 'top'), wing('mountain', 'bottom')] },
  ],
}

export const FINISH = {
  text: 'Pull the wings apart and stand the crane up. Drag to look around it.',
  share: 0.42,
  stand: Math.PI / 2,
}
