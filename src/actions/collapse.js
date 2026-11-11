import { add, apply, compose, creaseSegment, cross, det, dot, invert, lerp, reflection, scale, sub, unit } from '../geometry.js'
import { opposite } from '../scene.js'
import { axis, foldAlong, motionPhase, plain, tracked } from './motion.js'
import { squashTraced } from './squash.js'

export const LEVEL = 7
const SOUNDS = ['ギュッ', 'パタン']
const DOWN = [0, -1]

const turnLeft = ([x, y]) => [-y, x]
const midpointsOf = poly => poly.map((p, i) => lerp(p, poly[(i + 1) % poly.length], 0.5))
const centreOf = poly => scale(poly.reduce(add, [0, 0]), 1 / poly.length)

const frameOf = (faces, { base, toward = DOWN }) => {
  const { poly } = faces[0]
  const centre = centreOf(poly)
  const ends = base === 'waterbomb' ? midpointsOf(poly) : poly
  const end = ends.reduce((best, p) => (dot(p, toward) > dot(best, toward) + 1e-9 ? p : best))
  const down = sub(end, centre)
  return { centre, end, down, side: turnLeft(down) }
}

const turned = (faces, mirror) =>
  faces
    .map(face => ({
      ...face,
      poly: face.poly.map(p => apply(mirror, p)),
      matrix: compose(mirror, face.matrix),
      colorUp: !face.colorUp,
    }))
    .reverse()

const behind = (faces, mirror, from) =>
  faces.map(face => ({
    ...face,
    path: face.path.map(step =>
      step.window[0] < from ? step : axis(apply(mirror, step.from), apply(mirror, step.to), -step.lift, step.window),
    ),
  }))

export const tracedCollapse = (faces, action) => {
  const { centre, end, down, side } = frameOf(faces, action)
  const across = [sub(centre, side), add(centre, side)]
  const halved = foldAlong(
    tracked(faces),
    { from: across[0], to: across[1], mover: sub(centre, down), kind: 'valley' },
    axis(...across, 1, [0, 0.2]),
  )
  const quartered = foldAlong(
    halved,
    { from: centre, to: end, mover: sub(centre, side), kind: 'valley' },
    axis(centre, end, 1, [0.2, 0.4]),
  )
  const flap = sign => ({
    from: centre,
    to: end,
    mover: add(centre, add(scale(side, 0.85 * sign), scale(down, 0.1))),
    diagonal: [centre, add(centre, add(down, scale(side, sign)))],
  })
  const front = squashTraced(quartered, flap(1), [0.4, 0.7])
  const mirror = reflection(centre, end)
  const back = squashTraced(turned(front, mirror), flap(-1), [0.7, 1])
  return behind(turned(back, mirror), mirror, 0.7)
}

export const collapse = (faces, action) => plain(tracedCollapse(faces, action))

const patternOf = (faces, { centre, down, side }) =>
  [
    [down, 'mountain'],
    [side, 'mountain'],
    [add(down, side), 'valley'],
    [sub(down, side), 'valley'],
  ].map(([along, kind]) => {
    const [from, to] = creaseSegment(faces, sub(centre, along), add(centre, along))
    return { type: 'crease', from, to, kind }
  })

const collinear = (a, b) => [b.from, b.to].every(p => Math.abs(cross(unit(sub(a.to, a.from)), sub(p, a.from))) < 1e-7)

const keptCreases = (paper, lines) => {
  const back = invert(paper.faces[0].matrix)
  const flipped = det(paper.faces[0].matrix) < 0
  const fresh = lines
    .map(({ from, to, kind }) => ({ from: apply(back, from), to: apply(back, to), kind: flipped ? opposite(kind) : kind }))
    .filter(line => !(paper.creases ?? []).some(kept => collinear(line, kept)))
  return [...(paper.creases ?? []), ...fresh]
}

const marks = (paper, action) => {
  const frame = frameOf(paper.faces, action)
  const far = sub(frame.centre, frame.down)
  const control = add(frame.centre, scale(frame.side, 0.5))
  return [...patternOf(paper.faces, frame), { type: 'arrow', from: far, control, to: lerp(far, frame.end, 0.8) }]
}

export const collapseAction = {
  level: LEVEL,
  perform: (paper, action) => {
    const lines = patternOf(paper.faces, frameOf(paper.faces, action))
    const creased = { ...paper, creases: keptCreases(paper, lines) }
    const phase = motionPhase(creased, tracedCollapse(paper.faces, action), {
      kind: 'collapse',
      sounds: SOUNDS,
      duration: 1800,
    })
    return { paper: { ...creased, faces: phase.after, folds: [] }, phase }
  },
  marks,
}
