import { draw } from './draw.js'
import { mountain, valley } from './fold.js'
import { join } from './join.js'

export const actions = { valley, mountain, draw, join }

export const LEVELS = 9

export const kindsOf = model => [
  ...model.parts.flatMap(part => part.steps.flatMap(step => step.actions.map(action => action.kind))),
  ...(model.finish ? ['join'] : []),
]

export const difficultyOf = model => 1 + Math.max(...kindsOf(model).map(kind => actions[kind].level))
