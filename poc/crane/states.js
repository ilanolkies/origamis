import { actions } from '../../src/actions/index.js'
import { sheet } from '../../src/geometry.js'

export const statesOf = model => {
  let paper = { faces: sheet(model.sheet), doodles: [], folds: [], creases: [], tone: 'bird' }
  const states = [{ faces: paper.faces, step: 0 }]
  model.steps.forEach((step, index) => {
    for (const action of step.actions) {
      paper = actions[action.kind].perform(paper, action).paper
      states.push({ faces: paper.faces, step: index + 1 })
    }
  })
  return states
}
