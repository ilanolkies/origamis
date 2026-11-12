import { add3, cross3, dot3, scale3, sub3, unit3 } from './vec.js'

const PAPER = [1, 0.992, 0.965]
const COLOUR = [0.894, 0.361, 0.251]
const INK = [0.114, 0.106, 0.133, 1]
const SHEET = [1, 0.992, 0.965, 1]
const RULE_INK = [0.31, 0.624, 0.902, 0.16]
const SHADE = [0.114, 0.106, 0.133, 0.16]
const LIGHT = unit3([-0.35, 0.3, -1])
const REACH = 3.3
const FILL = 0.92
const INKED = 0.3
const TABLE = 2.3
const RULE = 0.23
const NEAR = 0.2
const FAR = 40
const WIDE = 1.25
const OUTLINE = 2.4
const HAIR = 1
const PULL = 0.0015

const VERTEX = 'attribute vec4 place; attribute vec4 tint; varying vec4 shade; void main() { shade = tint; gl_Position = place; }'
const FRAGMENT = 'precision mediump float; varying vec4 shade; void main() { gl_FragColor = shade; }'

const programOf = gl => {
  const program = gl.createProgram()
  for (const [kind, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]]) {
    const shader = gl.createShader(kind)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  gl.useProgram(program)
  return program
}

const cameraOf = ({ yaw, pitch, target, radius }, width, height) => {
  const distance = radius * REACH
  const away = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)]
  const eye = add3(target, scale3(away, distance))
  const forward = scale3(away, -1)
  const right = unit3(cross3(forward, [0, 0, 1]))
  const up = cross3(right, forward)
  const focal = (FILL * distance) / radius
  const unitPixels = Math.min(width / (2 * WIDE), height / 2)
  const zoom = [(focal * unitPixels * 2) / width, (focal * unitPixels * 2) / height]
  const clip = p => {
    const d = sub3(p, eye)
    const depth = dot3(d, forward)
    return [
      zoom[0] * dot3(d, right),
      zoom[1] * dot3(d, up),
      ((FAR + NEAR) * depth - 2 * FAR * NEAR) / (FAR - NEAR),
      depth,
    ]
  }
  return { eye, clip, forward }
}

const centreOf = points => scale3(points.reduce(add3, [0, 0, 0]), 1 / points.length)

export const createView = canvas => {
  const gl = canvas.getContext('webgl', { stencil: true, antialias: true, premultipliedAlpha: false })
  const program = programOf(gl)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  for (const [name, offset] of [['place', 0], ['tint', 16]]) {
    const slot = gl.getAttribLocation(program, name)
    gl.enableVertexAttribArray(slot)
    gl.vertexAttribPointer(slot, 4, gl.FLOAT, false, 32, offset)
  }
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.enable(gl.BLEND)
  gl.polygonOffset(1, 1)

  const flush = data => {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW)
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 8)
  }

  return (pose, mesh, lens) => {
    const ratio = window.devicePixelRatio || 1
    const width = Math.round(canvas.clientWidth * ratio)
    const height = Math.round(canvas.clientHeight * ratio)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    gl.viewport(0, 0, width, height)
    const camera = cameraOf(lens, width, height)

    const fan = (data, points, tint) => {
      const placed = points.map(camera.clip)
      for (let i = 1; i < placed.length - 1; i++) data.push(...placed[0], ...tint, ...placed[i], ...tint, ...placed[i + 1], ...tint)
    }
    const line = (data, from, to, tint, thick) => {
      let a = from
      let b = to
      const da = dot3(sub3(a, camera.eye), camera.forward) - NEAR
      const db = dot3(sub3(b, camera.eye), camera.forward) - NEAR
      if (da < 0 && db < 0) return
      if (da < 0) a = add3(a, scale3(sub3(b, a), da / (da - db)))
      if (db < 0) b = add3(b, scale3(sub3(a, b), db / (db - da)))
      const [p, q] = [a, b].map(point => {
        const [x, y, z, w] = camera.clip(point)
        return [x / w, y / w, z / w - PULL / w]
      })
      const along = [(q[0] - p[0]) * width, (q[1] - p[1]) * height]
      const size = Math.hypot(...along) || 1
      const side = [(-along[1] / size) * ((thick * ratio) / width), (along[0] / size) * ((thick * ratio) / height)]
      const corner = (point, way) => [point[0] + side[0] * way, point[1] + side[1] * way, point[2], 1, ...tint]
      data.push(...corner(p, 1), ...corner(p, -1), ...corner(q, 1), ...corner(q, 1), ...corner(p, -1), ...corner(q, -1))
    }

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.STENCIL_TEST)

    const rim = Array.from({ length: 64 }, (_, i) => {
      const angle = (i / 64) * 2 * Math.PI
      return [TABLE * Math.cos(angle), TABLE * Math.sin(angle), 0]
    })
    const floor = []
    for (let i = 0; i < rim.length; i++) fan(floor, [[0, 0, 0], rim[i], rim[(i + 1) % rim.length]], SHEET)
    for (let offset = -TABLE + RULE / 2; offset < TABLE; offset += RULE) {
      const reach = Math.sqrt(TABLE * TABLE - offset * offset)
      line(floor, [offset, -reach, 0], [offset, reach, 0], RULE_INK, HAIR)
      line(floor, [-reach, offset, 0], [reach, offset, 0], RULE_INK, HAIR)
    }
    rim.forEach((point, i) => line(floor, point, rim[(i + 1) % rim.length], INK, OUTLINE))
    flush(floor)

    gl.enable(gl.STENCIL_TEST)
    gl.stencilFunc(gl.NOTEQUAL, 1, 1)
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)
    const cast = []
    for (const { points } of pose.faces) fan(cast, points.map(p => sub3(p, scale3(LIGHT, p[2] / LIGHT[2]))), SHADE)
    flush(cast)
    gl.disable(gl.STENCIL_TEST)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.POLYGON_OFFSET_FILL)
    const sheets = []
    const edges = []
    pose.faces.forEach(({ points, normal }, face) => {
      const seesUp = dot3(normal, sub3(camera.eye, centreOf(points))) > 0
      const lit = 0.6 + 0.4 * Math.abs(dot3(normal, LIGHT))
      fan(sheets, points, [...(seesUp ? PAPER : COLOUR).map(value => value * lit), 1])
      points.forEach((point, i) => {
        const hinge = mesh.edges[face][i]
        if (hinge >= 0 && Math.abs(pose.phi[hinge]) < INKED) return
        line(edges, point, points[(i + 1) % points.length], INK, OUTLINE)
      })
    })
    flush(sheets)
    gl.disable(gl.POLYGON_OFFSET_FILL)
    flush(edges)
  }
}
