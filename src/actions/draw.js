import { fitView, look } from '../scene.js'

const SOUNDS = ['カキカキ']

const doodle = (strokes, progress) => ({ type: 'doodle', strokes, progress })

const drawing = (items, strokes) => {
  const view = fitView(items)
  return {
    kind: 'draw',
    sounds: SOUNDS,
    duration: 2000,
    frame: t => ({ view, items: [...items, doodle(strokes, t)] }),
  }
}

export const draw = {
  level: 0,
  perform: (paper, { strokes }) => ({
    paper: { ...paper, doodles: [...paper.doodles, doodle(strokes, 1)] },
    phase: drawing(look(paper), strokes),
  }),
  assemble: (items, { strokes }) => ({ items: [...items, doodle(strokes, 1)], phase: drawing(items, strokes) }),
  marks: (paper, { strokes }) => [{ ...doodle(strokes, 1), guide: true }],
}
