import { add, apply, bounds, compose, polar } from '../geometry.js'
import { ease, fitView, look, mixView } from '../scene.js'
import { centreOf } from './turn.js'

const SOUNDS = ['クルン']

const rotation = (centre, degrees) => {
  const [c, s] = polar(degrees)
  return [c, -s, centre[0] - c * centre[0] + s * centre[1], s, c, centre[1] - s * centre[0] - c * centre[1]]
}

const spin = (paper, m) => ({
  ...paper,
  faces: paper.faces.map(face => ({ ...face, poly: face.poly.map(p => apply(m, p)), matrix: compose(m, face.matrix) })),
  doodles: paper.doodles.map(doodle => ({
    ...doodle,
    strokes: doodle.strokes.map(stroke => stroke.map(p => apply(m, p))),
  })),
})

export const rotate = {
  level: 1,
  perform: (paper, { degrees }) => {
    const centre = centreOf(paper.faces)
    const done = spin(paper, rotation(centre, degrees))
    const viewFrom = fitView(look(paper))
    const viewTo = fitView(look(done))
    return {
      paper: done,
      phase: {
        kind: 'rotate',
        sounds: SOUNDS,
        duration: 900,
        frame: t => ({
          view: mixView(viewFrom, viewTo, ease(t)),
          items: look(spin(paper, rotation(centre, degrees * ease(t)))),
        }),
      },
    }
  },
  marks: (paper, { degrees }) => {
    const centre = centreOf(paper.faces)
    const box = bounds(paper.faces)
    const radius = 0.3 * Math.min(box.maxX - box.minX, box.maxY - box.minY)
    const start = 90 - degrees / 2
    const half = (Math.min(Math.abs(degrees) / 2, 60) * Math.PI) / 180
    return [
      {
        type: 'arrow',
        from: add(centre, polar(start, radius)),
        control: add(centre, polar(90, radius / Math.cos(half))),
        to: add(centre, polar(start + degrees, radius)),
      },
    ]
  },
}
