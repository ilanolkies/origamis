import { add3, cross3, dot3, scale3, sub3, unit3 } from './vec.js'
import { THICKNESS } from './fold3d.js'

const PAPER = [255, 253, 246]
const COLOUR = [228, 92, 64]
const LIGHT = unit3([-0.35, 0.3, -1])
const REACH = 3.3
const FILL = 0.92
const INKED = 0.3
const TABLE = 2.3
const RULE = 0.23
const SLACK = THICKNESS * 0.3
const NEAR = 0.15

const number = v => v.toFixed(4)
const spot = p => `${number(p[0])} ${number(-p[1])}`
const spots = poly => poly.map(p => `${number(p[0])},${number(-p[1])}`).join(' ')

const noise = n => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

const scribble = (a, b, seed, wobble) => {
  const span = Math.hypot(b[0] - a[0], b[1] - a[1])
  if (span < 1e-5) return ''
  const along = [(b[0] - a[0]) / span, (b[1] - a[1]) / span]
  const across = [-along[1], along[0]]
  const over = Math.min(wobble * 2, span * 0.08)
  const shifted = (p, forward, sideways) => [
    p[0] + along[0] * forward + across[0] * sideways,
    p[1] + along[1] * forward + across[1] * sideways,
  ]
  const start = shifted(a, -over * (0.5 + 0.5 * noise(seed)), wobble * noise(seed + 1))
  const end = shifted(b, over * (0.5 + 0.5 * noise(seed + 2)), wobble * noise(seed + 3))
  const middle = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const control = shifted(middle, span * 0.2 * noise(seed + 4), wobble * 1.6 * noise(seed + 5))
  return `M${spot(start)}Q${spot(control)} ${spot(end)}`
}

export const cameraOf = ({ yaw, pitch, target, radius }) => {
  const distance = radius * REACH
  const away = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)]
  const eye = add3(target, scale3(away, distance))
  const forward = scale3(away, -1)
  const right = unit3(cross3(forward, [0, 0, 1]))
  const up = cross3(right, forward)
  const focal = (FILL * distance) / radius
  const project = p => {
    const d = sub3(p, eye)
    const depth = dot3(d, forward)
    return [(focal * dot3(d, right)) / depth, (focal * dot3(d, up)) / depth, depth]
  }
  const depthOf = p => dot3(sub3(p, eye), forward)
  return { eye, project, depthOf }
}

const ahead = (points, camera, closed) => {
  const out = []
  points.forEach((p, i) => {
    if (!closed && i === points.length - 1) {
      if (camera.depthOf(p) >= NEAR) out.push(p)
      return
    }
    const q = points[(i + 1) % points.length]
    const dp = camera.depthOf(p) - NEAR
    const dq = camera.depthOf(q) - NEAR
    if (dp >= 0) out.push(p)
    if (dp * dq < 0) out.push(add3(p, scale3(sub3(q, p), dp / (dp - dq))))
  })
  return out
}

const normalOf = points => {
  let n = [0, 0, 0]
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length]
    n = add3(n, [(p[1] - q[1]) * (p[2] + q[2]), (p[2] - q[2]) * (p[0] + q[0]), (p[0] - q[0]) * (p[1] + q[1])])
  })
  return unit3(n)
}

const centreOf = points => scale3(points.reduce(add3, [0, 0, 0]), 1 / points.length)

const apart = (a, b) => {
  for (const ring of [a, b]) {
    for (let i = 0; i < ring.length; i++) {
      const p = ring[i]
      const q = ring[(i + 1) % ring.length]
      const nx = q[1] - p[1]
      const ny = p[0] - q[0]
      const size = Math.hypot(nx, ny) || 1
      let lowA = Infinity
      let highA = -Infinity
      let lowB = Infinity
      let highB = -Infinity
      for (const v of a) {
        const d = (v[0] * nx + v[1] * ny) / size
        lowA = Math.min(lowA, d)
        highA = Math.max(highA, d)
      }
      for (const v of b) {
        const d = (v[0] * nx + v[1] * ny) / size
        lowB = Math.min(lowB, d)
        highB = Math.max(highB, d)
      }
      if (highA - lowB < 2e-3 || highB - lowA < 2e-3) return true
    }
  }
  return false
}

const sideOf = (points, plane) => {
  let front = 0
  let back = 0
  for (const p of points) {
    const d = dot3(sub3(p, plane.centre), plane.toEye)
    if (d > SLACK) front++
    else if (d < -SLACK) back++
  }
  if (front && !back) return 1
  if (back && !front) return -1
  return 0
}

const inFront = (a, b) => -sideOf(b.points, a) || sideOf(a.points, b) || Math.sign(b.depth - a.depth)

const painted = shapes => {
  const count = shapes.length
  const above = shapes.map(() => [])
  const waiting = shapes.map(() => 0)
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const a = shapes[i]
      const b = shapes[j]
      if (a.box[0] > b.box[2] || b.box[0] > a.box[2] || a.box[1] > b.box[3] || b.box[1] > a.box[3]) continue
      if (apart(a.screen, b.screen)) continue
      const order = inFront(a, b)
      if (order > 0) {
        above[j].push(i)
        waiting[i]++
      } else if (order < 0) {
        above[i].push(j)
        waiting[j]++
      }
    }
  }
  const left = new Set(shapes.map((_, i) => i))
  const out = []
  while (left.size) {
    let pick = -1
    let stuck = -1
    for (const i of left) {
      if (stuck < 0 || shapes[i].depth > shapes[stuck].depth) stuck = i
      if (waiting[i] === 0 && (pick < 0 || shapes[i].depth > shapes[pick].depth)) pick = i
    }
    const next = pick < 0 ? stuck : pick
    left.delete(next)
    out.push(shapes[next])
    for (const other of above[next]) waiting[other]--
  }
  return out
}

const table = camera => {
  const rim = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * 2 * Math.PI
    return [TABLE * Math.cos(angle), TABLE * Math.sin(angle), 0]
  })
  const rules = []
  for (let offset = -TABLE + RULE / 2; offset < TABLE; offset += RULE) {
    const reach = Math.sqrt(TABLE * TABLE - offset * offset)
    rules.push([[offset, -reach, 0], [offset, reach, 0]], [[-reach, offset, 0], [reach, offset, 0]])
  }
  const lines = rules
    .map(rule => ahead(rule, camera, false))
    .filter(rule => rule.length === 2)
    .map(([a, b]) => `M${spot(camera.project(a))}L${spot(camera.project(b))}`)
    .join('')
  return `<polygon class="table" points="${spots(ahead(rim, camera, true).map(camera.project))}"/><path class="rule" d="${lines}"/>`
}

export const renderPose = (pose, mesh, camera, seed) => {
  const wobble = 0.005
  const shapes = pose.faces.map(({ points, normal }, face) => {
    const centre = centreOf(points)
    const flat = normalOf(points)
    const facing = dot3(flat, normal) < 0 ? scale3(flat, -1) : flat
    const seesUp = dot3(facing, sub3(camera.eye, centre)) > 0
    const toEye = seesUp ? facing : scale3(facing, -1)
    const screen = points.map(camera.project)
    const xs = screen.map(p => p[0])
    const ys = screen.map(p => p[1])
    return {
      face,
      points,
      centre,
      toEye,
      seesUp,
      screen,
      depth: camera.project(centre)[2],
      box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    }
  })
  const cast = pose.faces
    .map(({ points }) => spots(points.map(p => camera.project(sub3(p, scale3(LIGHT, p[2] / LIGHT[2]))))))
    .map(points => `<polygon points="${points}"/>`)
    .join('')
  const body = painted(shapes)
    .map(shape => {
      const lit = 0.7 + 0.3 * Math.abs(dot3(shape.toEye, LIGHT))
      const fill = `rgb(${(shape.seesUp ? PAPER : COLOUR).map(v => Math.round(v * lit)).join(' ')})`
      const ink = shape.screen
        .map((p, i) => {
          const hinge = mesh.edges[shape.face][i]
          if (hinge >= 0 && Math.abs(pose.phi[hinge]) < INKED) return ''
          const q = shape.screen[(i + 1) % shape.screen.length]
          const key = seed * 13.7 + shape.face * 31.1 + i * 7.3
          return scribble(p, q, key, wobble) + scribble(p, q, key + 100, wobble)
        })
        .join('')
      return `<polygon points="${spots(shape.screen)}" fill="${fill}" stroke="${fill}" stroke-width="0.004"/><path class="ink" d="${ink}"/>`
    })
    .join('')
  return `${table(camera)}<g class="cast">${cast}</g>${body}`
}
