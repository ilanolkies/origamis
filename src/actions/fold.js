import {
  add,
  apply,
  clip,
  compose,
  contains,
  creaseSegment,
  cross,
  det,
  dot,
  flatten,
  invert,
  length,
  lerp,
  overlaps,
  reflection,
  scale,
  seams,
  sub,
  unit,
} from '../geometry.js'
import { ease, fitView, linesOf, mixView, moveLines, opposite, scene } from '../scene.js'

const CAMERA_HEIGHT = 5
const LIGHT = [0.22, -0.28]
const SOUNDS = ['パタッ', 'ペタッ', 'スッ', 'キュッ']

const LAYERED = 4
const TUCKED = 5
const PROBE = 1e-3

export const lifted = (faces, { from, to, mover, layers }, sign, mirror) => {
  const all = faces.map((_, i) => i)
  if (layers === undefined) return new Set(all)
  const parts = faces.map(face => clip(face.poly, from, to, sign))
  const flat = faces.map(flatten)
  const below = layers === 'bottom'
  const probe = lerp(mover, apply(mirror, mover), PROBE)
  const under = all.filter(i => parts[i] && contains(faces[i].poly, probe))
  const reached = under.length ? under : all.filter(i => parts[i])
  const order = below ? reached : [...reached].reverse()
  const picked = new Set(order.slice(0, typeof layers === 'number' ? layers : 1))
  const across = p => sign * cross(sub(to, from), sub(p, from)) > 1e-7
  const joined = (i, j) =>
    seams(flat[i], flat[j]).some(seam => seam.some(p => across(apply(faces[i].matrix, p))))
  const covers = (i, j) => (below ? j < i : j > i) && parts[i] && parts[j] && overlaps(parts[i], parts[j])
  let grown = true
  while (grown) {
    grown = false
    for (const i of picked) {
      for (const j of all) {
        if (!picked.has(j) && (joined(i, j) || covers(i, j))) {
          picked.add(j)
          grown = true
        }
      }
    }
  }
  return picked
}

const pocketOf = (stays, landed, hinges, { kind, into = 0 }) => {
  const valley = kind === 'valley'
  const covered = stays.map((_, i) => i).filter(i => landed.some(flap => overlaps(stays[i].poly, flap.poly)))
  const passed = (valley ? covered.reverse() : covered).slice(0, into === 'inside' ? Infinity : into)
  if (!passed.length) return valley ? stays.length : 0
  if (valley) return Math.max(passed.at(-1), ...hinges.map(i => i + 1))
  return Math.min(passed.at(-1) + 1, ...hinges)
}

export const fold = (faces, crease) => {
  const { from, to, mover } = crease
  const sign = cross(sub(to, from), sub(mover, from)) > 0 ? 1 : -1
  const mirror = reflection(from, to)
  const picked = lifted(faces, crease, sign, mirror)
  const stays = []
  const moving = []
  const hinges = []
  faces.forEach((face, i) => {
    if (!picked.has(i)) {
      stays.push(face)
      return
    }
    const stay = clip(face.poly, from, to, -sign)
    const move = clip(face.poly, from, to, sign)
    if (stay) stays.push({ ...face, poly: stay })
    if (move) moving.push({ ...face, poly: move })
    if (stay && move) hinges.push(stays.length - 1)
  })
  const landed = moving
    .map(face => ({
      ...face,
      poly: face.poly.map(p => apply(mirror, p)),
      matrix: compose(mirror, face.matrix),
      colorUp: !face.colorUp,
    }))
    .reverse()
  const at = pocketOf(stays, landed, hinges, crease)
  return {
    faces: [...stays.slice(0, at), ...landed, ...stays.slice(at)],
    at,
    stays,
    moving,
    layers: faces.filter((_, i) => picked.has(i)),
  }
}

const swingPhase = (before, crease, paper) => {
  const result = fold(before, crease)
  const axis = unit(sub(crease.to, crease.from))
  const viewFrom = fitView(before)
  const viewTo = fitView(result.faces)
  const eye = lerp(viewFrom.center, viewTo.center, 0.5)
  const lift = crease.kind === 'valley' ? 1 : -1
  const [lineFrom, lineTo] = creaseSegment(result.layers, crease.from, crease.to)
  const stays = scene(result.stays, paper)

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
        lines: moveLines(linesOf(face, paper.creases), p => project(swing(p, angle))),
        colorUp: flipped ? !face.colorUp : face.colorUp,
        tone: paper.tone,
        back: paper.back,
        shade: 1 - tilt * (flipped ? 0.3 : 0.12),
      }))
      if (flipped) movers.reverse()
      const line = { type: 'crease', from: lineFrom, to: lineTo, kind: crease.kind }
      const cast = {
        type: 'shadow',
        polys: swung.map(({ points }) => points.map(({ flat, height }) => add(flat, scale(LIGHT, height)))),
        opacity: 0.3 * tilt,
      }
      const tucked = crease.into && flipped
      const items = tucked
        ? [...stays.slice(0, result.at), cast, ...movers, ...stays.slice(result.at), line]
        : lift > 0
          ? [...stays, line, cast, ...movers]
          : [...movers, ...stays, line]
      return { view: mixView(viewFrom, viewTo, ease(t)), items }
    },
  }
}

const foldMarks = (paper, action) => {
  const [from, to] = creaseSegment(fold(paper.faces, action).layers, action.from, action.to)
  const target = apply(reflection(action.from, action.to), action.mover)
  const reach = length(sub(target, action.mover))
  const control = add(
    lerp(action.mover, target, 0.5),
    scale(unit(sub(action.to, action.from)), action.bend * 0.45 * reach),
  )
  return [
    { type: 'crease', from, to, kind: action.kind },
    { type: 'arrow', from: action.mover, control, to: target, under: Boolean(action.into) },
  ]
}

const performFold = (paper, action) => {
  const phase = swingPhase(paper.faces, action, paper)
  const folds = [...(paper.folds ?? []), { before: paper.faces, crease: action }]
  return { paper: { ...paper, faces: phase.after, folds }, phase }
}

const scored = (faces, crease) =>
  fold(faces, crease)
    .layers.filter(face => clip(face.poly, crease.from, crease.to, 1) && clip(face.poly, crease.from, crease.to, -1))
    .map(face => {
      const back = invert(face.matrix)
      const [from, to] = creaseSegment([face], crease.from, crease.to).map(p => apply(back, p))
      return { from, to, kind: det(face.matrix) > 0 ? crease.kind : opposite(crease.kind) }
    })

const lastFold = paper => paper.folds.at(-1)

const performUnfold = paper => {
  const { before, crease } = lastFold(paper)
  const creases = [...(paper.creases ?? []), ...scored(before, crease)]
  const opened = { ...paper, faces: before, folds: paper.folds.slice(0, -1), creases }
  const { sounds, duration, frame } = swingPhase(before, crease, opened)
  return { paper: opened, phase: { kind: 'unfold', sounds, duration, frame: t => frame(1 - t) } }
}

const unfoldMarks = paper => {
  if (!paper.folds?.length) return []
  const { crease } = lastFold(paper)
  return foldMarks(paper, { ...crease, mover: apply(reflection(crease.from, crease.to), crease.mover) })
}

export const moveFolds = (folds = [], m, moveFaces) =>
  folds.map(({ before, crease }) => ({
    before: moveFaces(before),
    crease: {
      ...crease,
      from: apply(m, crease.from),
      to: apply(m, crease.to),
      mover: apply(m, crease.mover),
      kind: det(m) > 0 ? crease.kind : opposite(crease.kind),
      bend: det(m) > 0 ? crease.bend : -crease.bend,
    },
  }))

const layered = base => action => {
  if (action.into) return TUCKED
  return action.layers === undefined ? base : Math.max(base, LAYERED)
}

const folding = { level: layered(0), perform: performFold, marks: foldMarks }

export const valley = folding
export const mountain = folding

export const unfold = { level: 3, perform: performUnfold, marks: unfoldMarks }

export const crease = {
  level: layered(3),
  perform: (paper, action) => {
    const folded = performFold(paper, { ...action, kind: action.fold ?? 'valley' })
    const opened = performUnfold(folded.paper)
    return { paper: opened.paper, phase: [folded.phase, opened.phase] }
  },
  marks: (paper, action) => foldMarks(paper, { ...action, kind: action.fold ?? 'valley' }),
}
