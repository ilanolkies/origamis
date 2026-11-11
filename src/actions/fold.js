import {
  add,
  apply,
  clip,
  compose,
  creaseSegment,
  cross,
  dot,
  length,
  lerp,
  reflection,
  scale,
  sub,
  unit,
} from '../geometry.js'
import { ease, fitView, mixView, scene } from '../scene.js'

const CAMERA_HEIGHT = 5
const LIGHT = [0.22, -0.28]
const SOUNDS = ['パタッ', 'ペタッ', 'スッ', 'キュッ']

export const fold = (faces, { from, to, mover, kind }) => {
  const sign = cross(sub(to, from), sub(mover, from)) > 0 ? 1 : -1
  const mirror = reflection(from, to)
  const stays = []
  const moving = []
  for (const face of faces) {
    const stay = clip(face.poly, from, to, -sign)
    const move = clip(face.poly, from, to, sign)
    if (stay) stays.push({ ...face, poly: stay })
    if (move) moving.push({ ...face, poly: move })
  }
  const landed = moving
    .map(face => ({
      poly: face.poly.map(p => apply(mirror, p)),
      matrix: compose(mirror, face.matrix),
      colorUp: !face.colorUp,
    }))
    .reverse()
  return { faces: kind === 'valley' ? [...stays, ...landed] : [...landed, ...stays], stays, moving }
}

const swingPhase = (before, crease, tone) => {
  const result = fold(before, crease)
  const axis = unit(sub(crease.to, crease.from))
  const viewFrom = fitView(before)
  const viewTo = fitView(result.faces)
  const eye = lerp(viewFrom.center, viewTo.center, 0.5)
  const lift = crease.kind === 'valley' ? 1 : -1
  const [lineFrom, lineTo] = creaseSegment(before, crease.from, crease.to)
  const stays = scene(result.stays, tone)

  const swing = (p, angle) => {
    const foot = add(crease.from, scale(axis, dot(sub(p, crease.from), axis)))
    const arm = sub(p, foot)
    return { flat: add(foot, scale(arm, Math.cos(angle))), height: length(arm) * Math.sin(angle) * lift }
  }
  const project = ({ flat, height }) =>
    add(eye, scale(sub(flat, eye), CAMERA_HEIGHT / (CAMERA_HEIGHT - height)))

  return {
    kind: 'fold',
    sounds: SOUNDS,
    duration: 1150,
    after: result.faces,
    frame: t => {
      const angle = Math.PI * ease(t)
      const flipped = angle > Math.PI / 2
      const tilt = Math.sin(angle)
      const swung = result.moving.map(face => ({ face, points: face.poly.map(p => swing(p, angle)) }))
      const movers = swung.map(({ face, points }) => ({
        type: 'face',
        poly: points.map(project),
        colorUp: flipped ? !face.colorUp : face.colorUp,
        tone,
        shade: 1 - tilt * (flipped ? 0.3 : 0.12),
      }))
      if (flipped) movers.reverse()
      const line = { type: 'crease', from: lineFrom, to: lineTo, kind: crease.kind }
      const cast = {
        type: 'shadow',
        polys: swung.map(({ points }) => points.map(({ flat, height }) => add(flat, scale(LIGHT, height)))),
        opacity: 0.3 * tilt,
      }
      return {
        view: mixView(viewFrom, viewTo, ease(t)),
        items: lift > 0 ? [...stays, line, cast, ...movers] : [...movers, ...stays, line],
      }
    },
  }
}

const crease = {
  level: 0,
  perform: (paper, action) => {
    const phase = swingPhase(paper.faces, action, paper.tone)
    return { paper: { ...paper, faces: phase.after }, phase }
  },
  marks: (paper, action) => {
    const [from, to] = creaseSegment(paper.faces, action.from, action.to)
    const target = apply(reflection(action.from, action.to), action.mover)
    const reach = length(sub(target, action.mover))
    const control = add(
      lerp(action.mover, target, 0.5),
      scale(unit(sub(action.to, action.from)), action.bend * 0.45 * reach),
    )
    return [
      { type: 'crease', from, to, kind: action.kind },
      { type: 'arrow', from: action.mover, control, to: target },
    ]
  },
}

export const valley = crease
export const mountain = crease
