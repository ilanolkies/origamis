import { add, apply, compose, dot, invert, length, lerp, reflection, scale, sub, unit } from '../geometry.js'
import { ease, fitView, linesOf, mixView, moveLines, scene } from '../scene.js'
import { fold } from './fold.js'

const CAMERA_HEIGHT = 5

export const axis = (from, to, lift, window = [0, 1]) => ({ from, to, lift, window, mirror: reflection(from, to) })

export const tracked = faces => faces.map((face, rank) => ({ ...face, rank, origin: face, path: [] }))

export const foldAlong = (faces, crease, along) => {
  const result = fold(faces, crease)
  const landed = new Set(result.faces.slice(result.at, result.at + result.moving.length))
  return result.faces.map(face => (landed.has(face) ? { ...face, path: [...face.path, along] } : face))
}

export const byRank = faces => [...faces].sort((a, b) => a.rank - b.rank)

export const halves = (picked, sizeOf) => {
  const total = picked.reduce((sum, i) => sum + sizeOf(i), 0)
  let sum = 0
  const back = picked.filter(i => {
    const behind = sum < total / 2 - 1e-9
    sum += sizeOf(i)
    return behind
  })
  return { back, front: picked.slice(back.length) }
}

export const plain = faces => faces.map(({ poly, matrix, colorUp }) => ({ poly, matrix, colorUp }))

const stateOf = (path, t) => {
  let done = 0
  for (const step of path) {
    const [start, end] = step.window
    const u = Math.min(1, Math.max(0, (t - start) / (end - start)))
    if (u >= 1) {
      done++
      continue
    }
    return { done, step: u > 0 ? step : null, angle: Math.PI * ease(u) }
  }
  return { done, step: null, angle: 0 }
}

const swing = (p, { from, to, lift }, angle) => {
  const along = unit(sub(to, from))
  const foot = add(from, scale(along, dot(sub(p, from), along)))
  const arm = sub(p, foot)
  return { flat: add(foot, scale(arm, Math.cos(angle))), height: length(arm) * Math.sin(angle) * lift }
}

export const motionPhase = (paper, moved, { kind, sounds, duration = 1300, lines = [] }) => {
  const after = plain(moved)
  const viewFrom = fitView(scene(paper.faces, paper))
  const viewTo = fitView(scene(after, paper))
  const eye = lerp(viewFrom.center, viewTo.center, 0.5)
  const project = ({ flat, height }) => add(eye, scale(sub(flat, eye), CAMERA_HEIGHT / (CAMERA_HEIGHT - height)))
  const pieces = moved.map((face, index) => {
    const back = compose(face.origin.matrix, invert(face.matrix))
    const start = { poly: face.poly.map(p => apply(back, p)), matrix: face.origin.matrix }
    return { face, index, start, lines: linesOf(start, paper.creases) }
  })

  return {
    kind,
    sounds,
    duration,
    after,
    frame: t => {
      const late = t >= 0.5
      const items = pieces.map(piece => {
        const { done, step, angle } = stateOf(piece.face.path, t)
        const move = p => {
          const flat = piece.face.path.slice(0, done).reduce((q, s) => apply(s.mirror, q), p)
          return project(step ? swing(flat, step, angle) : { flat, height: 0 })
        }
        const flipped = (done + (step && angle > Math.PI / 2 ? 1 : 0)) % 2 === 1
        const tilt = step ? Math.sin(angle) : 0
        return {
          lift: step ? step.lift : 0,
          order: late ? piece.index : piece.face.rank + piece.index / moved.length,
          item: {
            type: 'face',
            poly: piece.start.poly.map(move),
            lines: moveLines(piece.lines, move),
            colorUp: flipped ? !piece.face.origin.colorUp : piece.face.origin.colorUp,
            tone: paper.tone,
            back: paper.back,
            shade: 1 - tilt * 0.2,
          },
        }
      })
      const layer = lift => items.filter(entry => entry.lift === lift).sort((a, b) => a.order - b.order)
      const faces = [...layer(-1), ...layer(0), ...layer(1)].map(entry => entry.item)
      const creases = lines.map(line => ({ type: 'crease', ...line }))
      return { view: mixView(viewFrom, viewTo, ease(t)), items: [...faces, ...creases] }
    },
  }
}
