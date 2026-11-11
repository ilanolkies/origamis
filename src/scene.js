import { add, apply, bounds, lerp, polar } from './geometry.js'

export const ease = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
export const settle = t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2

export const scene = (faces, { tone, back }) =>
  faces.map(face => ({ type: 'face', poly: face.poly, colorUp: face.colorUp, tone, back, shade: 1 }))

export const shifted = (items, offset, opacity = 1) =>
  items.map(item =>
    item.type === 'doodle'
      ? { ...item, strokes: item.strokes.map(stroke => stroke.map(p => add(p, offset))), opacity }
      : { ...item, poly: item.poly.map(p => add(p, offset)), opacity },
  )

export const placement = ({ seat = [0, 0], rotate = 0, mirror = false, scale = 1 }) => {
  const [c, s] = polar(rotate, scale)
  const flip = mirror ? -1 : 1
  return [c * flip, -s, seat[0], s * flip, c, seat[1]]
}

export const placed = (items, where) => {
  const matrix = placement(where)
  const move = p => apply(matrix, p)
  return items.map(item =>
    item.type === 'doodle'
      ? { ...item, strokes: item.strokes.map(stroke => stroke.map(move)) }
      : { ...item, poly: item.poly.map(move) },
  )
}

export const fitView = items => {
  const box = bounds(items.filter(item => item.poly))
  return {
    center: [(box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2],
    size: Math.max(1.5, Math.max(box.maxX - box.minX, box.maxY - box.minY) * 1.45),
  }
}

export const mixView = (a, b, t) => ({ center: lerp(a.center, b.center, t), size: a.size + (b.size - a.size) * t })

export const look = paper => [...scene(paper.faces, paper), ...paper.doodles]
