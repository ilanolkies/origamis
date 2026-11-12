import { add, apply, area, clip, compose, contains, counterClockwise, cross, det, dot, flatten, invert, length, overlaps, scale, sub, unit } from '../../src/geometry.js'
import { add3, lerp3, length3, mulMat, mulVec, rotation, scale3, sub3, turnBetween } from './vec.js'

export const THICKNESS = 0.0015
const GRID = 1e6
const RELAX_ROUNDS = 14
const NUDGE = 0.02

const same = (a, b) => a.every((value, i) => Math.abs(value - b[i]) < 1e-7)
const centreOf = poly => scale(poly.reduce(add, [0, 0]), 1 / poly.length)

const intersect = (poly, other) => {
  let piece = poly
  for (let i = 0; piece && i < other.length; i++) piece = clip(piece, other[i], other[(i + 1) % other.length], 1)
  return piece
}

const refine = states =>
  states.reduce(
    (fine, state) => {
      const flats = state.faces.map(face => counterClockwise(flatten(face)))
      return fine.flatMap(poly => {
        const pieces = flats.map(flat => intersect(poly, flat)).filter(Boolean)
        return pieces.length ? pieces : [poly]
      })
    },
    [counterClockwise(flatten(states[0].faces[0]))],
  )

const weld = polys => {
  const ids = new Map()
  const coords = []
  const idOf = p => {
    const key = `${Math.round(p[0] * GRID)},${Math.round(p[1] * GRID)}`
    if (!ids.has(key)) {
      ids.set(key, coords.length)
      coords.push(p)
    }
    return ids.get(key)
  }
  const rings = polys
    .map(poly => poly.map(idOf).filter((id, i, ring) => id !== ring[(i + 1) % ring.length]))
    .filter(ring => ring.length >= 3)
  return { coords, rings }
}

const stitched = ({ coords, rings }) =>
  rings.map(ring =>
    ring.flatMap((id, i) => {
      const from = coords[id]
      const span = sub(coords[ring[(i + 1) % ring.length]], from)
      const size = length(span)
      const between = coords
        .map((p, other) => ({ other, along: dot(sub(p, from), span) / (size * size), off: Math.abs(cross(span, sub(p, from))) / size }))
        .filter(({ along, off }) => off < 1e-6 && along * size > 1e-6 && (1 - along) * size > 1e-6)
        .sort((a, b) => a.along - b.along)
      return [id, ...between.map(({ other }) => other)]
    }),
  )

const hingesOf = (rings, coords, centres) => {
  const sides = new Map()
  rings.forEach((ring, face) =>
    ring.forEach((id, i) => {
      const next = ring[(i + 1) % ring.length]
      const key = id < next ? `${id}-${next}` : `${next}-${id}`
      sides.set(key, [...(sides.get(key) ?? []), { face, edge: i, a: id, b: next }])
    }),
  )
  const hinges = []
  const edges = rings.map(ring => ring.map(() => -1))
  for (const pair of sides.values()) {
    if (pair.length !== 2) continue
    const [first, second] = pair
    const a = coords[first.a]
    const along = unit(sub(coords[first.b], a))
    edges[first.face][first.edge] = hinges.length
    edges[second.face][second.edge] = hinges.length
    hinges.push({
      f: first.face,
      g: second.face,
      a: [a[0], a[1], 0],
      along: [along[0], along[1], 0],
      side: Math.sign(cross(along, sub(centres[second.face], a))),
    })
  }
  return { hinges, edges }
}

const depthsOf = faces => {
  const depths = []
  faces.forEach((face, i) => {
    let depth = 0
    for (let j = 0; j < i; j++) if (depths[j] > depth && overlaps(faces[j].poly, face.poly)) depth = depths[j]
    depths.push(depth + 1)
  })
  return depths
}

const frameOf = (state, mesh) => {
  const flats = state.faces.map(flatten)
  const depths = depthsOf(state.faces)
  const middle = (Math.max(...depths) + 1) / 2
  const home = mesh.centres.map(centre => flats.findIndex(flat => contains(flat, centre)))
  const matrix = home.map(i => state.faces[i].matrix)
  const up = matrix.map(m => Math.sign(det(m)))
  const phi = mesh.hinges.map(({ f, g }) => (same(matrix[f], matrix[g]) ? 0 : Math.PI * up[f] * Math.sign(home[g] - home[f])))
  const lift = home.map((i, face) => (depths[i] - middle) * THICKNESS * up[face])
  const total = mesh.areas.reduce((sum, value) => sum + value, 0)
  const centre = mesh.centres
    .map((p, face) => scale(apply(matrix[face], p), mesh.areas[face] / total))
    .reduce(add, [0, 0])
  return { matrix, phi, lift, centre: [centre[0], centre[1], 0], loose: new Set(), stand: 0 }
}

const embed = m => ({ R: [m[0], m[1], 0, m[3], m[4], 0, 0, 0, det(m)], t: [m[2], m[5], 0] })

const planOf = (from, to, mesh) => {
  const count = mesh.rings.length
  const fixed = face => same(from.matrix[face], to.matrix[face]) && !from.loose.has(face) && !to.loose.has(face)
  const all = mesh.rings.map((_, face) => face)
  const pool = all.some(fixed) ? all.filter(fixed) : all
  const root = pool.reduce((best, face) => (mesh.areas[face] > mesh.areas[best] ? face : best))
  const links = []
  const seen = new Set([root])
  const near = [root]
  const far = []
  const visit = face => {
    mesh.around[face].forEach(({ hinge, other, sign }) => {
      if (seen.has(other)) return
      const rigid = Math.abs(from.phi[hinge] - to.phi[hinge]) < 1e-9
      if (!rigid) {
        far.push({ face: other, parent: face, hinge, sign })
        return
      }
      seen.add(other)
      links.push({ face: other, parent: face, hinge, sign })
      near.push(other)
    })
  }
  while (seen.size < count) {
    while (near.length) visit(near.shift())
    const next = far.shift()
    if (!next) break
    if (seen.has(next.face)) continue
    seen.add(next.face)
    links.push(next)
    near.push(next.face)
  }
  const start = embed(from.matrix[root])
  const end = embed(to.matrix[root])
  const turn = turnBetween(start.R, end.R)
  const arm = sub3(start.t, from.centre)
  const landing = sub3(end.t, mulVec(rotation(turn.axis, turn.angle), arm))
  const plan = { root, links, start, turn, arm, landing, still: same(from.matrix[root], to.matrix[root]) }
  return { ...plan, reverse: reverseOf(mesh, plan, from, to) }
}

const rootAt = (plan, from, t) => {
  if (plan.still) return plan.start
  const spin = rotation(plan.turn.axis, plan.turn.angle * t)
  return { R: mulMat(spin, plan.start.R), t: add3(mulVec(spin, plan.arm), lerp3(from.centre, plan.landing, t)) }
}

const about = (point, axis, angle) => {
  const R = rotation(axis, angle)
  return { R, t: sub3(point, mulVec(R, point)) }
}

const then = (outer, inner) => ({ R: mulMat(outer.R, inner.R), t: add3(mulVec(outer.R, inner.t), outer.t) })

const hinged = (mesh, plan, from, phi, t) => {
  const placed = new Array(mesh.rings.length)
  placed[plan.root] = rootAt(plan, from, t)
  for (const { face, parent, hinge, sign } of plan.links) {
    const { a, along } = mesh.hinges[hinge]
    placed[face] = then(placed[parent], about(a, along, phi[hinge] * sign))
  }
  return placed
}

const reverseOf = (mesh, plan, from, to) => {
  if (!plan.still) return null
  const moving = mesh.rings.map((_, face) => face).filter(face => !same(from.matrix[face], to.matrix[face]))
  if (!moving.length) return null
  const mirrors = moving.map(face => compose(to.matrix[face], invert(from.matrix[face])))
  const [mirror] = mirrors
  if (det(mirror) > 0 || mirrors.some(m => !same(m, mirror))) return null
  const phi = from.phi.map((value, hinge) => value + (to.phi[hinge] - value) * NUDGE)
  const probe = hinged(mesh, plan, from, phi, NUDGE)
  const heading = new Map(
    moving.map(face => {
      const [x, y] = mesh.centres[face]
      return [face, Math.sign(mulVec(probe[face].R, [x, y, 0])[2] + probe[face].t[2])]
    }),
  )
  const ridge = mesh.hinges.filter(({ f, g }) => heading.has(f) && heading.has(g) && heading.get(f) !== heading.get(g))
  if (!ridge.length) return null
  const tilt = Math.atan2(mirror[3], mirror[0]) / 2
  const crease = { from: [mirror[2] / 2, mirror[5] / 2], along: [Math.cos(tilt), Math.sin(tilt)] }
  const ends = ridge.flatMap(({ f, a, along }) => [a, add3(a, along)].map(p => apply(from.matrix[f], p)))
  const run = sub(ends[1], ends[0])
  const pivot = add(ends[0], scale(run, cross(sub(crease.from, ends[0]), crease.along) / cross(run, crease.along)))
  const far = ends.reduce((best, p) => (length(sub(p, pivot)) > length(sub(best, pivot)) ? p : best))
  const spine = unit(sub(far, pivot))
  const landed = unit(sub(apply(mirror, far), pivot))
  const roll = new Map(
    moving.map(face => {
      const side = Math.sign(cross(spine, sub(apply(from.matrix[face], mesh.centres[face]), pivot))) || 1
      return [face, heading.get(face) * side]
    }),
  )
  return { pivot: [pivot[0], pivot[1], 0], spine, sweep: Math.atan2(cross(spine, landed), dot(spine, landed)), roll }
}

const reversed = (placed, { pivot, spine, sweep, roll }, from, t) => {
  const angle = sweep * t
  const swung = about(pivot, [0, 0, 1], angle)
  const ridge = [
    spine[0] * Math.cos(angle) - spine[1] * Math.sin(angle),
    spine[0] * Math.sin(angle) + spine[1] * Math.cos(angle),
    0,
  ]
  for (const [face, way] of roll) {
    placed[face] = then(about(pivot, ridge, way * Math.PI * t), then(swung, embed(from.matrix[face])))
  }
}

const relax = (points, springs) => {
  for (let round = 0; round < RELAX_ROUNDS; round++) {
    for (const { a, b, rest } of springs) {
      const gap = sub3(points[b], points[a])
      const size = length3(gap)
      if (size < 1e-12) continue
      const push = scale3(gap, (0.5 * (size - rest)) / size)
      points[a] = add3(points[a], push)
      points[b] = sub3(points[b], push)
    }
  }
}

const springsOf = (rings, coords) => {
  const seen = new Set()
  const springs = []
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i++) {
      for (let j = i + 1; j < ring.length; j++) {
        const [a, b] = ring[i] < ring[j] ? [ring[i], ring[j]] : [ring[j], ring[i]]
        const key = a * coords.length + b
        if (seen.has(key)) continue
        seen.add(key)
        springs.push({ a, b, rest: length(sub(coords[a], coords[b])) })
      }
    }
  }
  return springs
}

export const build = states => {
  const welded = weld(refine(states))
  const rings = stitched(welded)
  const { coords } = welded
  const polys = rings.map(ring => ring.map(id => coords[id]))
  const centres = polys.map(centreOf)
  const areas = polys.map(poly => Math.abs(area(poly)))
  const { hinges, edges } = hingesOf(rings, coords, centres)
  const around = rings.map(() => [])
  hinges.forEach(({ f, g, side }, hinge) => {
    around[f].push({ hinge, other: g, sign: side })
    around[g].push({ hinge, other: f, sign: -side })
  })
  const mesh = { coords, rings, centres, areas, hinges, edges, around, springs: springsOf(rings, coords) }
  return { mesh, frames: states.map(state => frameOf(state, mesh)) }
}

export const opened = (frames, since, share, stand) => {
  const before = frames[since]
  const last = frames.at(-1)
  const loose = new Set(last.matrix.map((m, face) => (same(m, before.matrix[face]) ? -1 : face)).filter(face => face >= 0))
  const phi = last.phi.map((value, hinge) => before.phi[hinge] + (value - before.phi[hinge]) * share)
  return { ...last, phi, loose, stand }
}

export const animator = ({ mesh, frames }) => {
  const plans = frames.slice(1).map((to, i) => planOf(frames[i], to, mesh))
  const sheet = mesh.coords.map(p => [p[0], p[1], 0])
  return (index, t) => {
    const from = frames[index]
    const to = frames[index + 1]
    const plan = plans[index]
    const phi = from.phi.map((value, hinge) => value + (to.phi[hinge] - value) * t)
    const placed = hinged(mesh, plan, from, phi, t)
    if (plan.reverse) reversed(placed, plan.reverse, from, t)
    const sums = sheet.map(() => [0, 0, 0])
    const counts = sheet.map(() => 0)
    const guesses = mesh.rings.map((ring, face) =>
      ring.map(id => {
        const p = add3(mulVec(placed[face].R, sheet[id]), placed[face].t)
        sums[id] = add3(sums[id], p)
        counts[id]++
        return p
      }),
    )
    const points = sums.map((sum, id) => scale3(sum, 1 / counts[id]))
    let tear = 0
    mesh.rings.forEach((ring, face) =>
      ring.forEach((id, i) => {
        tear = Math.max(tear, length3(sub3(guesses[face][i], points[id])))
      }),
    )
    if (tear > 1e-9) relax(points, mesh.springs)
    const stand = rotation([1, 0, 0], from.stand + (to.stand - from.stand) * t)
    const upright = points.map(p => mulVec(stand, p))
    const floor = Math.min(...upright.map(p => p[2]))
    const faces = mesh.rings.map((ring, face) => {
      const normal = mulVec(stand, [placed[face].R[2], placed[face].R[5], placed[face].R[8]])
      const lift = from.lift[face] + (to.lift[face] - from.lift[face]) * t
      const raise = add3(scale3(normal, lift), [0, 0, -floor])
      return { points: ring.map(id => add3(upright[id], raise)), normal }
    })
    return { faces, phi, tear, points: upright }
  }
}
