import { IDENTITY3, mulMat, mulVec, rotation } from '../crane/vec.js'

const SPOKES = 8
const DAMPING = 1e-6
const ROUNDS = 12
const NUDGE = 1e-5

const rim = Array.from({ length: SPOKES }, (_, i) => {
  const angle = Math.PI / 2 + (i * Math.PI) / 4
  const reach = i % 2 ? Math.SQRT1_2 : 1
  return [reach * Math.cos(angle), reach * Math.sin(angle), 0]
})
const spokes = rim.map(([x, y]) => {
  const size = Math.hypot(x, y)
  return [x / size, y / size, 0]
})

export const ROOT = 4
export const sheet = {
  faces: rim.map((point, i) => [[0, 0, 0], point, rim[(i + 1) % SPOKES]]),
  edges: rim.map((_, i) => [i, -1, (i + 1) % SPOKES]),
}

const around = angles => {
  const turns = [IDENTITY3]
  for (let step = 1; step <= SPOKES; step++) {
    const crease = (ROOT + step) % SPOKES
    turns.push(mulMat(turns.at(-1), rotation(spokes[crease], angles[crease])))
  }
  return turns
}

export const gap = angles => around(angles).at(-1).map((value, i) => value - IDENTITY3[i])

const solve = (matrix, right) => {
  const size = right.length
  const rows = matrix.map((row, i) => [...row, right[i]])
  for (let column = 0; column < size; column++) {
    let pivot = column
    for (let row = column + 1; row < size; row++) if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row
    ;[rows[column], rows[pivot]] = [rows[pivot], rows[column]]
    for (let row = column + 1; row < size; row++) {
      const factor = rows[row][column] / rows[column][column]
      for (let k = column; k <= size; k++) rows[row][k] -= factor * rows[column][k]
    }
  }
  const out = new Array(size).fill(0)
  for (let row = size - 1; row >= 0; row--) {
    let sum = rows[row][size]
    for (let k = row + 1; k < size; k++) sum -= rows[row][k] * out[k]
    out[row] = sum / rows[row][row]
  }
  return out
}

const closed = (guess, free) => {
  let angles = [...guess]
  for (let round = 0; round < ROUNDS; round++) {
    const miss = gap(angles)
    const slopes = free.map(crease => {
      const moved = [...angles]
      moved[crease] += NUDGE
      return gap(moved).map((value, i) => (value - miss[i]) / NUDGE)
    })
    const normal = miss.map((_, i) =>
      miss.map((__, j) => slopes.reduce((sum, slope) => sum + slope[i] * slope[j], 0) + (i === j ? DAMPING : 0)),
    )
    const weights = solve(normal, miss)
    free.forEach((crease, k) => {
      angles[crease] -= slopes[k].reduce((sum, value, i) => sum + value * weights[i], 0)
    })
  }
  return angles
}

export const folding = (from, to, frames) => {
  const free = from.map((_, crease) => crease).filter(crease => from[crease] !== 0 || to[crease] !== 0)
  const path = [from]
  for (let frame = 1; frame <= frames; frame++) {
    const now = path.at(-1)
    const guess = now.map((value, crease) => value + (to[crease] - value) / (frames - frame + 1))
    path.push(closed(guess, free))
  }
  return path
}

export const poseOf = angles => {
  const turns = around(angles)
  const placed = sheet.faces.map((points, face) => {
    const turn = turns[(face - ROOT + SPOKES) % SPOKES]
    return { points: points.map(point => mulVec(turn, point)), normal: mulVec(turn, [0, 0, -1]) }
  })
  const floor = Math.min(...placed.flatMap(({ points }) => points.map(point => point[2])))
  return {
    faces: placed.map(({ points, normal }) => ({ points: points.map(([x, y, z]) => [x, y, z - floor]), normal })),
    phi: angles,
  }
}
