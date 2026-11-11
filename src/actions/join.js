import { ease, fitView, mixView, placed, settle, shifted } from '../scene.js'

const DROP_HEIGHT = 1.4
const SOUNDS = ['ポンッ']

export const join = {
  level: 0,
  assemble: (items, action, pieces) => {
    const piece = placed(pieces[action.part], action)
    const joined = [...items, ...piece]
    const viewFrom = fitView(items)
    const viewTo = fitView(joined)
    return {
      items: joined,
      phase: {
        kind: 'join',
        sounds: SOUNDS,
        duration: 1200,
        frame: t => ({
          view: mixView(viewFrom, viewTo, ease(t)),
          items: [...items, ...shifted(piece, [0, (1 - settle(t)) * DROP_HEIGHT], Math.min(1, t * 3))],
        }),
      },
    }
  },
  marks: () => [],
}
