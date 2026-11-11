import { add, apply, area, creaseSegment, cross, length, lerp, reflection, scale, sub, unit } from '../geometry.js'
import { lifted } from './fold.js'
import { axis, foldAlong, halves, motionPhase, plain, tracked } from './motion.js'

const LEVEL = 6
const SOUNDS = ['グッ', 'ペタン']

const flapOf = (faces, { from, to, mover }) => {
  const sign = cross(sub(to, from), sub(mover, from)) > 0 ? 1 : -1
  const picked = lifted(faces, { from, to, mover, layers: 'top' }, sign, reflection(from, to))
  return [...picked].sort((a, b) => a - b)
}

const mirrored = ({ from, to, diagonal }) => diagonal.map(p => apply(reflection(from, to), p))

const span = ([start, end], [from, to]) => [start + (end - start) * from, start + (end - start) * to]

export const squashTraced = (all, action, window = [0, 1]) => {
  const { from, to, mover, diagonal } = action
  const flap = flapOf(all, action)
  const { back: staying, front: opening } = halves(flap, i => Math.abs(area(all[i].poly)))
  const [near, far] = diagonal
  const [otherNear, otherFar] = mirrored(action)
  const lowered = foldAlong(
    staying.map(i => all[i]),
    { from: near, to: far, mover, kind: 'valley' },
    axis(near, far, 1, span(window, [0.5, 1])),
  )
  const opened = foldAlong(
    opening.map(i => all[i]),
    { from, to, mover, kind: 'valley' },
    axis(from, to, 1, span(window, [0, 0.5])),
  )
  const spread = foldAlong(
    opened,
    { from: otherNear, to: otherFar, mover: apply(reflection(from, to), mover), kind: 'valley' },
    axis(otherNear, otherFar, 1, span(window, [0.5, 1])),
  )
  const below = all.filter((_, i) => i < flap[0])
  const above = all.filter((_, i) => i > flap[0] && !flap.includes(i))
  return [...below, ...lowered, ...spread, ...above]
}

const squashFold = (faces, action) => squashTraced(tracked(faces), action)

export const squash = (faces, action) => plain(squashFold(faces, action))

const creasesOf = (paper, action) => {
  const flap = flapOf(paper.faces, action).map(i => paper.faces[i])
  const [from, to] = creaseSegment(flap, ...action.diagonal)
  const mirror = reflection(action.from, action.to)
  return [
    { type: 'crease', from, to, kind: 'valley' },
    { type: 'crease', from: apply(mirror, from), to: apply(mirror, to), kind: 'valley' },
  ]
}

const marks = (paper, action) => {
  const [line] = creasesOf(paper, action)
  const target = apply(reflection(...action.diagonal), action.mover)
  const [near, far] = action.diagonal
  const bend = scale(unit(sub(far, near)), (action.bend ?? 1) * 0.45 * length(sub(target, action.mover)))
  return [line, { type: 'arrow', from: action.mover, control: add(lerp(action.mover, target, 0.5), bend), to: target }]
}

export const squashAction = {
  level: LEVEL,
  perform: (paper, action) => {
    const phase = motionPhase(paper, squashFold(paper.faces, action), {
      kind: 'squash',
      sounds: SOUNDS,
      duration: 1500,
      lines: creasesOf(paper, action),
    })
    return { paper: { ...paper, faces: phase.after, folds: [] }, phase }
  },
  marks,
}
