// A sheet of paper is a list of flat faces. Each face keeps its corners twice:
// `uv` on the unfolded sheet and `at` in space. Folding never stretches a face,
// it only cuts faces along the crease and swings one side around it.

export const THICKNESS = 0.004
const EPS = 1e-6

export const sheet = polygons =>
  polygons.map(uv => ({ uv, at: uv.map(([x, y]) => [x, y, 0]) }))

const mix = (a, b, t) => a.map((value, i) => value + (b[i] - value) * t)

function clip(face, distances, sign) {
  const uv = []
  const at = []
  face.at.forEach((point, i) => {
    const j = (i + 1) % face.at.length
    const a = distances[i] * sign
    const b = distances[j] * sign
    if (a >= -EPS) {
      uv.push(face.uv[i])
      at.push(point)
    }
    if ((a > EPS && b < -EPS) || (a < -EPS && b > EPS)) {
      const t = a / (a - b)
      uv.push(mix(face.uv[i], face.uv[j], t))
      at.push(mix(point, face.at[j], t))
    }
  })
  return { uv, at }
}

// The crease is a line drawn on the table, seen from above. Everything to the
// left of `from -> to` moves, through every layer. A positive angle is a valley
// fold (the paper comes up), a negative one a mountain fold (it goes under).
export function crease(faces, { from, to, angle, text = '' }) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const length = Math.hypot(dx, dy)
  const side = ([x, y]) => ((y - from[1]) * dx - (x - from[0]) * dy) / length

  const still = []
  const moving = []
  const hinge = []
  for (const face of faces) {
    const distances = face.at.map(side)
    if (distances.every(distance => distance <= EPS)) {
      still.push(face)
      continue
    }
    const part = clip(face, distances, 1)
    moving.push(part)
    hinge.push(...part.at.filter(point => Math.abs(side(point)) <= EPS).map(point => point[2]))
    if (distances.some(distance => distance < -EPS)) still.push(clip(face, distances, -1))
  }

  // Paper has thickness: a valley fold turns around the top of the stack and a
  // mountain fold around the bottom, so a flat fold lands on the pile, not in it.
  let height = 0
  if (hinge.length) {
    height = angle > 0 ? Math.max(...hinge) + THICKNESS / 2 : Math.min(...hinge) - THICKNESS / 2
  }

  return {
    still,
    moving,
    angle,
    text,
    axis: { point: [from[0], from[1], height], direction: [dx / length, dy / length, 0] },
  }
}

function rotate(point, { point: origin, direction: k }, radians) {
  const v = point.map((value, i) => value - origin[i])
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const dot = (k[0] * v[0] + k[1] * v[1] + k[2] * v[2]) * (1 - cos)
  const cross = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]]
  return v.map((value, i) => origin[i] + value * cos + cross[i] * sin + k[i] * dot)
}

// The faces of a step, `t` of the way through its fold (0 = before, 1 = done).
export function pose({ still, moving, axis, angle }, t = 1) {
  const radians = (angle * t * Math.PI) / 180
  return [
    ...still,
    ...moving.map(face => ({ uv: face.uv, at: face.at.map(point => rotate(point, axis, radians)) })),
  ]
}

export function timeline(model) {
  let faces = sheet(model.sheet)
  return model.folds.map(fold => {
    const step = crease(faces, fold)
    faces = pose(step)
    return step
  })
}
