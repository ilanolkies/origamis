import { add } from '../geometry.js'
import { ease, fitView, mixView, settle, shifted } from '../scene.js'

const DROP_HEIGHT = 1.4
const SOUNDS = ['ポンッ']

export const join = {
  level: 0,
  perform: (base, top, { seat }) => {
    const joined = [...base, ...shifted(top, seat)]
    const viewFrom = fitView(base)
    const viewTo = fitView(joined)
    return {
      joined,
      phase: {
        kind: 'join',
        sounds: SOUNDS,
        duration: 1200,
        frame: t => ({
          view: mixView(viewFrom, viewTo, ease(t)),
          items: [...base, ...shifted(top, add(seat, [0, (1 - settle(t)) * DROP_HEIGHT]), Math.min(1, t * 3))],
        }),
      },
    }
  },
}
