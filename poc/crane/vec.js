export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k]
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const length3 = a => Math.hypot(a[0], a[1], a[2])
export const unit3 = a => scale3(a, 1 / (length3(a) || 1))
export const lerp3 = (a, b, t) => add3(a, scale3(sub3(b, a), t))

export const IDENTITY3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]

export const mulVec = (m, v) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
]

export const mulMat = (a, b) => {
  const out = new Array(9)
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      out[row * 3 + column] = a[row * 3] * b[column] + a[row * 3 + 1] * b[3 + column] + a[row * 3 + 2] * b[6 + column]
    }
  }
  return out
}

export const transpose = m => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]

export const rotation = ([x, y, z], angle) => {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const k = 1 - c
  return [
    c + x * x * k, x * y * k - z * s, x * z * k + y * s,
    y * x * k + z * s, c + y * y * k, y * z * k - x * s,
    z * x * k - y * s, z * y * k + x * s, c + z * z * k,
  ]
}

const halfTurnAxis = m => {
  const size = [0, 4, 8].map(i => Math.sqrt(Math.max(0, (m[i] + 1) / 2)))
  const lead = size.indexOf(Math.max(...size))
  return size.map((value, i) => (i === lead ? value : value * (Math.sign(m[lead * 3 + i] + m[i * 3 + lead]) || 1)))
}

export const turnBetween = (from, to) => {
  const m = mulMat(to, transpose(from))
  const angle = Math.acos(Math.min(1, Math.max(-1, (m[0] + m[4] + m[8] - 1) / 2)))
  if (angle < 1e-9) return { axis: [0, 0, 1], angle: 0 }
  if (Math.PI - angle < 1e-6) return { axis: unit3(halfTurnAxis(m)), angle: Math.PI }
  return { axis: unit3([m[7] - m[5], m[2] - m[6], m[3] - m[1]]), angle }
}
