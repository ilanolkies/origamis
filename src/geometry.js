const EPSILON = 1e-9

export const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
export const scale = (a, k) => [a[0] * k, a[1] * k]
export const cross = (a, b) => a[0] * b[1] - a[1] * b[0]
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
export const length = a => Math.hypot(a[0], a[1])
export const unit = a => scale(a, 1 / length(a))
export const lerp = (a, b, t) => add(a, scale(sub(b, a), t))
export const polar = (degrees, radius = 1) => [
  radius * Math.cos((degrees * Math.PI) / 180),
  radius * Math.sin((degrees * Math.PI) / 180),
]

export const IDENTITY = [1, 0, 0, 0, 1, 0]

export const apply = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2], m[3] * p[0] + m[4] * p[1] + m[5]]

export const compose = (a, b) => [
  a[0] * b[0] + a[1] * b[3],
  a[0] * b[1] + a[1] * b[4],
  a[0] * b[2] + a[1] * b[5] + a[2],
  a[3] * b[0] + a[4] * b[3],
  a[3] * b[1] + a[4] * b[4],
  a[3] * b[2] + a[4] * b[5] + a[5],
]

export const det = m => m[0] * m[4] - m[1] * m[3]

export const invert = m => {
  const [a, b, tx, c, d, ty] = m
  const det = a * d - b * c
  const ia = d / det
  const ib = -b / det
  const ic = -c / det
  const id = a / det
  return [ia, ib, -(ia * tx + ib * ty), ic, id, -(ic * tx + id * ty)]
}

export const reflection = (from, to) => {
  const d = unit(sub(to, from))
  const a = d[0] * d[0] - d[1] * d[1]
  const b = 2 * d[0] * d[1]
  return [a, b, from[0] - (a * from[0] + b * from[1]), b, -a, from[1] - (b * from[0] - a * from[1])]
}

export const area = poly =>
  poly.reduce((sum, point, i) => sum + cross(point, poly[(i + 1) % poly.length]), 0) / 2

export const counterClockwise = poly => (area(poly) > 0 ? poly : [...poly].reverse())

export const bounds = faces => {
  const xs = faces.flatMap(face => face.poly.map(p => p[0]))
  const ys = faces.flatMap(face => face.poly.map(p => p[1]))
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
}

export const clip = (poly, from, to, sign) => {
  const d = sub(to, from)
  const out = []
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length]
    const sa = sign * cross(d, sub(a, from))
    const sb = sign * cross(d, sub(b, from))
    if (sa >= -EPSILON) out.push(a)
    if ((sa > EPSILON && sb < -EPSILON) || (sa < -EPSILON && sb > EPSILON)) {
      out.push(lerp(a, b, sa / (sa - sb)))
    }
  })
  const clean = out.filter((p, i) => i === 0 || length(sub(p, out[i - 1])) > EPSILON)
  if (clean.length > 1 && length(sub(clean[0], clean[clean.length - 1])) <= EPSILON) clean.pop()
  return clean.length >= 3 && Math.abs(area(clean)) > 1e-10 ? clean : null
}

export const sheet = corners => [{ poly: corners, matrix: IDENTITY, colorUp: false }]

const strictlyInside = (poly, point) => {
  const ring = counterClockwise(poly)
  return ring.every((a, i) => cross(sub(ring[(i + 1) % ring.length], a), sub(point, a)) > 1e-7)
}

const pierces = (poly, start, end) => {
  const ring = counterClockwise(poly)
  const margin = 1e-6
  let t0 = 0
  let t1 = 1
  for (let i = 0; i < ring.length; i++) {
    const edge = unit(sub(ring[(i + 1) % ring.length], ring[i]))
    const f0 = cross(edge, sub(start, ring[i])) - margin
    const f1 = cross(edge, sub(end, ring[i])) - margin
    if (f0 <= 0 && f1 <= 0) return false
    if (f0 < 0) t0 = Math.max(t0, f0 / (f0 - f1))
    else if (f1 < 0) t1 = Math.min(t1, f0 / (f0 - f1))
  }
  return (t1 - t0) * length(sub(end, start)) > 1e-5
}

export const check = (faces, sheetArea) => {
  const flat = faces.map(face => face.poly.map(p => apply(invert(face.matrix), p)))
  const creases = []
  let tears = 0
  for (let i = 0; i < faces.length; i++) {
    for (let j = i + 1; j < faces.length; j++) {
      flat[i].forEach((p0, a) => {
        const d = sub(flat[i][(a + 1) % flat[i].length], p0)
        const size = length(d)
        flat[j].forEach((c0, b) => {
          const c1 = flat[j][(b + 1) % flat[j].length]
          if (Math.abs(cross(d, sub(c0, p0))) / size > 1e-7) return
          if (Math.abs(cross(d, sub(c1, p0))) / size > 1e-7) return
          const ta = dot(d, sub(c0, p0)) / (size * size)
          const tb = dot(d, sub(c1, p0)) / (size * size)
          const low = Math.max(0, Math.min(ta, tb))
          const high = Math.min(1, Math.max(ta, tb))
          if ((high - low) * size < 1e-7) return
          const ends = [add(p0, scale(d, low)), add(p0, scale(d, high))]
          const onI = ends.map(p => apply(faces[i].matrix, p))
          const onJ = ends.map(p => apply(faces[j].matrix, p))
          if (onI.some((p, k) => length(sub(p, onJ[k])) > 1e-7)) tears++
          else if (faces[i].matrix.some((v, k) => Math.abs(v - faces[j].matrix[k]) > 1e-7)) {
            creases.push({ i, j, start: onI[0], end: onI[1] })
          }
        })
      })
    }
  }
  let pierced = 0
  for (const crease of creases) {
    for (let k = crease.i + 1; k < crease.j; k++) {
      if (pierces(faces[k].poly, crease.start, crease.end)) pierced++
    }
  }
  const box = bounds(faces)
  const grid = 90
  let layers = 0
  for (let x = 0; x < grid; x++) {
    for (let y = 0; y < grid; y++) {
      const point = [
        box.minX + ((x + 0.5) * (box.maxX - box.minX)) / grid,
        box.minY + ((y + 0.5) * (box.maxY - box.minY)) / grid,
      ]
      layers = Math.max(layers, faces.filter(face => strictlyInside(face.poly, point)).length)
    }
  }
  const total = faces.reduce((sum, face) => sum + Math.abs(area(face.poly)), 0)
  return {
    faces: faces.length,
    layers,
    creases: creases.length,
    areaError: Math.abs(total - sheetArea),
    tears,
    pierced,
  }
}

export const creaseSegment = (faces, from, to) => {
  const d = unit(sub(to, from))
  let low = Infinity
  let high = -Infinity
  for (const face of faces) {
    const ring = counterClockwise(face.poly)
    let t0 = -Infinity
    let t1 = Infinity
    let outside = false
    for (let i = 0; i < ring.length; i++) {
      const edge = sub(ring[(i + 1) % ring.length], ring[i])
      const offset = cross(edge, sub(from, ring[i]))
      const slope = cross(edge, d)
      if (Math.abs(slope) < 1e-12) {
        if (offset < -EPSILON) outside = true
        continue
      }
      if (slope > 0) t0 = Math.max(t0, -offset / slope)
      else t1 = Math.min(t1, -offset / slope)
    }
    if (outside || t1 - t0 < EPSILON) continue
    low = Math.min(low, t0)
    high = Math.max(high, t1)
  }
  return [add(from, scale(d, low)), add(from, scale(d, high))]
}

export const within = (poly, from, to) => {
  const ring = counterClockwise(poly)
  const d = sub(to, from)
  let t0 = 0
  let t1 = 1
  for (let i = 0; i < ring.length; i++) {
    const edge = sub(ring[(i + 1) % ring.length], ring[i])
    const offset = cross(edge, sub(from, ring[i]))
    const slope = cross(edge, d)
    if (Math.abs(slope) < 1e-12) {
      if (offset < -EPSILON) return null
      continue
    }
    if (slope > 0) t0 = Math.max(t0, -offset / slope)
    else t1 = Math.min(t1, -offset / slope)
  }
  return (t1 - t0) * length(d) > EPSILON ? [lerp(from, to, t0), lerp(from, to, t1)] : null
}
