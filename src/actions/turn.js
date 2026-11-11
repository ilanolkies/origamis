import { add, apply, bounds, compose, dot, reflection, scale, sub, unit } from '../geometry.js'
import { ease, fitView, look, mixView, scene } from '../scene.js'

const CAMERA_HEIGHT = 5
const SOUNDS = ['クルッ', 'ペラッ']

export const centreOf = faces => {
  const box = bounds(faces)
  return [(box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2]
}

const axisOf = (faces, { from, to }) => {
  if (from && to) return [from, to]
  const centre = centreOf(faces)
  return [centre, add(centre, [0, 1])]
}

export const turnOver = (faces, [from, to]) => {
  const mirror = reflection(from, to)
  return faces
    .map(face => ({
      poly: face.poly.map(p => apply(mirror, p)),
      matrix: compose(mirror, face.matrix),
      colorUp: !face.colorUp,
    }))
    .reverse()
}

const flipPhase = (paper, [from, to], after) => {
  const along = unit(sub(to, from))
  const normal = [along[1], -along[0]]
  const viewFrom = fitView(look(paper))
  const viewTo = fitView(scene(after, paper))
  const eye = viewFrom.center

  const project = (p, angle) => {
    const offset = dot(normal, sub(p, from))
    const foot = sub(p, scale(normal, offset))
    const flat = add(foot, scale(normal, offset * Math.cos(angle)))
    const height = offset * Math.sin(angle)
    return add(eye, scale(sub(flat, eye), CAMERA_HEIGHT / (CAMERA_HEIGHT - height)))
  }

  return {
    kind: 'turn',
    sounds: SOUNDS,
    duration: 1000,
    frame: t => {
      const angle = Math.PI * ease(t)
      const flipped = angle > Math.PI / 2
      const faces = flipped ? [...paper.faces].reverse() : paper.faces
      const items = faces.map(face => ({
        type: 'face',
        poly: face.poly.map(p => project(p, angle)),
        colorUp: flipped ? !face.colorUp : face.colorUp,
        tone: paper.tone,
        shade: 1 - 0.25 * Math.sin(angle),
      }))
      const doodles = flipped
        ? []
        : paper.doodles.map(doodle => ({
            ...doodle,
            strokes: doodle.strokes.map(stroke => stroke.map(p => project(p, angle))),
          }))
      return { view: mixView(viewFrom, viewTo, ease(t)), items: [...items, ...doodles] }
    },
  }
}

export const turn = {
  level: 1,
  perform: (paper, action) => {
    const axis = axisOf(paper.faces, action)
    const faces = turnOver(paper.faces, axis)
    return { paper: { ...paper, faces, doodles: [] }, phase: flipPhase(paper, axis, faces) }
  },
  marks: (paper, action) => {
    const [from, to] = axisOf(paper.faces, action)
    const along = unit(sub(to, from))
    const normal = [along[1], -along[0]]
    const box = bounds(paper.faces)
    const reach = 0.3 * Math.min(box.maxX - box.minX, box.maxY - box.minY)
    const centre = add(from, scale(along, dot(along, sub(centreOf(paper.faces), from))))
    return [
      {
        type: 'arrow',
        from: add(centre, scale(normal, reach)),
        control: add(centre, scale(along, 1.4 * reach)),
        to: sub(centre, scale(normal, reach)),
      },
    ]
  },
}
