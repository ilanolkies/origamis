import { add, apply, clip, compose, contains, creaseSegment, cross, IDENTITY, length, lerp, reflection, scale, sub, unit } from '../geometry.js'
import { LEVEL } from './collapse.js'
import { axis, motionPhase, plain, tracked } from './motion.js'

const SOUNDS = ['スーッ', 'パタン']
const NUDGE = 0.03
const REACH = 0.75

const sideOf = (line, p) => Math.sign(cross(sub(line[1], line[0]), sub(p, line[0])))

const layersAt = (faces, p) =>
  faces
    .map((_, i) => i)
    .filter(i => contains(faces[i].poly, p))
    .reverse()

const flapOf = (faces, { from, to, mover }) => {
  const middle = lerp(from, to, 0.5)
  return [from, to].map(end => {
    const inner = scale(add(add(middle, mover), end), 1 / 3)
    const edge = lerp(mover, end, 0.5)
    const outer = add(edge, scale(unit(sub(edge, inner)), NUDGE * length(sub(end, mover))))
    return { end, front: layersAt(faces, inner)[0], second: layersAt(faces, outer)[1] }
  })
}

const moved = (face, mirrors, path) => {
  const m = mirrors.reduce((all, mirror) => compose(mirror, all), IDENTITY)
  return {
    ...face,
    poly: face.poly.map(p => apply(m, p)),
    matrix: compose(m, face.matrix),
    colorUp: mirrors.length % 2 ? !face.colorUp : face.colorUp,
    path,
  }
}

const petalTraced = (faces, action) => {
  const { from, to, mover } = action
  const hinge = [from, to]
  const below = sideOf(hinge, mover)
  const flap = flapOf(faces, action)
  const kites = flap.map(({ end }) => ({ line: [mover, end], out: -sideOf([mover, end], lerp(from, to, 0.5)) }))
  const lift = axis(from, to, 1, [0.35, 1])
  const all = tracked(faces)
  const stays = []
  const tucked = []
  const sides = []
  const centres = []
  all.forEach((face, i) => {
    const front = flap.some(side => side.front === i)
    const second = flap.some(side => side.second === i)
    if (!front && !second) {
      stays.push(face)
      return
    }
    const upper = front ? clip(face.poly, from, to, -below) : face.poly
    const lower = front ? clip(face.poly, from, to, below) : null
    const inner = kites.reduce((poly, { line, out }) => poly && clip(poly, ...line, -out), front ? lower : face.poly)
    const kept = front ? upper : inner
    if (kept) stays.push({ ...face, poly: kept })
    if (front && inner) centres.push(moved({ ...face, poly: inner }, [reflection(from, to)], [lift]))
    const source = front ? lower : face.poly
    for (const { line, out } of source ? kites : []) {
      const part = clip(source, ...line, out)
      if (!part) continue
      const fold = axis(...line, front ? -1 : 1, [0, 0.35])
      if (front) sides.push(moved({ ...face, poly: part }, [fold.mirror, reflection(from, to)], [fold, lift]))
      else tucked.push(moved({ ...face, poly: part }, [fold.mirror], [fold]))
    }
  })
  return [...stays, ...tucked, ...centres, ...sides]
}

export const petal = (faces, action) => plain(petalTraced(faces, action))

const marks = (paper, { from, to, mover, bend = 1 }) => {
  const [start, end] = creaseSegment(paper.faces, from, to)
  const target = lerp(mover, apply(reflection(from, to), mover), REACH)
  const control = add(lerp(mover, target, 0.5), scale(unit(sub(to, from)), bend * 0.25 * length(sub(target, mover))))
  return [
    { type: 'crease', from: start, to: end, kind: 'valley' },
    { type: 'crease', from: mover, to: from, kind: 'mountain' },
    { type: 'crease', from: mover, to, kind: 'mountain' },
    { type: 'arrow', from: mover, control, to: target },
  ]
}

export const petalAction = {
  level: LEVEL,
  perform: (paper, action) => {
    const phase = motionPhase(paper, petalTraced(paper.faces, action), { kind: 'petal', sounds: SOUNDS, duration: 1500 })
    return { paper: { ...paper, faces: phase.after, folds: [] }, phase }
  },
  marks,
}
