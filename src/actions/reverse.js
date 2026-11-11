import {
  add,
  apply,
  area,
  clip,
  contains,
  creaseSegment,
  cross,
  flatten,
  length,
  lerp,
  reflection,
  scale,
  seams,
  sub,
  unit,
} from '../geometry.js'
import { axis, byRank, foldAlong, halves, motionPhase, plain, tracked } from './motion.js'

const LEVEL = 6
const SINK_LEVEL = 7
const SOUNDS = ['グイッ', 'パタン']

const sideOf = ({ from, to, mover }) => (cross(sub(to, from), sub(mover, from)) > 0 ? 1 : -1)

const tipOf = (faces, { from, to, mover }) => {
  const sign = sideOf({ from, to, mover })
  const parts = faces.map(face => clip(face.poly, from, to, sign))
  const flat = faces.map(flatten)
  const across = p => sign * cross(sub(to, from), sub(p, from)) > 1e-7
  const joined = (i, j) => seams(flat[i], flat[j]).some(seam => seam.some(p => across(apply(faces[i].matrix, p))))
  const indices = faces.map((_, i) => i).filter(i => parts[i])
  const corners = indices.filter(i => faces[i].poly.some(p => length(sub(p, mover)) < 1e-7))
  const picked = new Set(corners.length ? corners : indices.filter(i => contains(parts[i], mover)))
  let grown = true
  while (grown) {
    grown = false
    for (const i of picked) {
      for (let j = 0; j < faces.length; j++) {
        if (!picked.has(j) && parts[j] && joined(i, j)) {
          picked.add(j)
          grown = true
        }
      }
    }
  }
  return { parts, picked: [...picked].sort((a, b) => a - b) }
}

const reverseFold = (faces, crease, outside) => {
  const { parts, picked } = tipOf(faces, crease)
  const { back, front } = halves(picked, i => Math.abs(area(parts[i])))
  const all = tracked(faces)
  const toward = outside ? -1 : 1
  const swing = (group, lift) =>
    foldAlong(
      group.map(i => all[i]),
      { ...crease, kind: lift > 0 ? 'valley' : 'mountain' },
      axis(crease.from, crease.to, lift),
    )
  const rear = swing(back, toward)
  const fore = swing(front, -toward)
  const landed = group => group.filter(face => face.path.length)
  const untouched = all.filter(face => !picked.includes(face.rank))
  const stays = byRank([...untouched, ...[...rear, ...fore].filter(face => !face.path.length)])
  const below = rank => stays.filter(face => face.rank < rank)
  const above = rank => stays.filter(face => face.rank >= rank)
  if (outside) {
    const first = picked[0]
    const after = picked.at(-1) + 1
    const middle = above(first).filter(face => face.rank < after)
    return [...below(first), ...landed(rear), ...middle, ...landed(fore), ...above(after)]
  }
  const split = front[0] ?? Infinity
  return [...below(split), ...landed(rear), ...landed(fore), ...above(split)]
}

export const reverse = (faces, crease, outside = false) => plain(reverseFold(faces, crease, outside))

const marksOf = outside => (paper, action) => {
  const { picked } = tipOf(paper.faces, action)
  const [from, to] = creaseSegment(picked.map(i => paper.faces[i]), action.from, action.to)
  const target = apply(reflection(action.from, action.to), action.mover)
  const bend = scale(unit(sub(action.to, action.from)), (action.bend ?? 1) * 0.45 * length(sub(target, action.mover)))
  return [
    { type: 'crease', from, to, kind: outside ? 'valley' : 'mountain' },
    {
      type: 'arrow',
      from: action.mover,
      control: add(lerp(action.mover, target, 0.5), bend),
      to: target,
      under: !outside,
    },
  ]
}

const reversing = outside => ({
  level: LEVEL,
  perform: (paper, action) => {
    const [line] = marksOf(outside)(paper, action)
    const phase = motionPhase(paper, reverseFold(paper.faces, action, outside), {
      kind: 'reverse',
      sounds: SOUNDS,
      lines: [line],
    })
    return { paper: { ...paper, faces: phase.after, folds: [] }, phase }
  },
  marks: marksOf(outside),
})

export const insideReverse = reversing(false)
export const outsideReverse = reversing(true)
export const sink = { ...reversing(false), level: SINK_LEVEL }
