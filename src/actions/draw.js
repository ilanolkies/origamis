import { fitView, look } from '../scene.js'

const SOUNDS = ['カキカキ']

export const draw = {
  level: 0,
  perform: (paper, { strokes }) => {
    const items = look(paper)
    const view = fitView(items)
    return {
      paper: { ...paper, doodles: [...paper.doodles, { type: 'doodle', strokes, progress: 1 }] },
      phase: {
        kind: 'draw',
        sounds: SOUNDS,
        duration: 2000,
        frame: t => ({ view, items: [...items, { type: 'doodle', strokes, progress: t }] }),
      },
    }
  },
  marks: (paper, { strokes }) => [{ type: 'doodle', strokes, progress: 1, guide: true }],
}
