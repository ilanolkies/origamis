import { dot, length, sub } from '../geometry.js'
import { draw } from './draw.js'
import { mountain, valley } from './fold.js'
import { join } from './join.js'
import { rotate } from './rotate.js'
import { turn } from './turn.js'

export const actions = { valley, mountain, draw, join, turn, rotate }

export const LEVELS = 9

const RECTANGLE_LEVEL = 1

export const kindsOf = model => [
  ...model.parts.flatMap(part => part.steps.flatMap(step => step.actions.map(action => action.kind))),
  ...(model.finish ? ['join'] : []),
]

export const isSquare = corners =>
  corners.length === 4 &&
  corners.every((corner, i) => {
    const next = corners[(i + 1) % 4]
    const side = sub(next, corner)
    const following = sub(corners[(i + 2) % 4], next)
    return Math.abs(length(side) - length(following)) < 1e-9 && Math.abs(dot(side, following)) < 1e-9
  })

const sheetLevel = model => (isSquare(model.sheet) ? 0 : RECTANGLE_LEVEL)

export const difficultyOf = model =>
  1 + Math.max(sheetLevel(model), ...kindsOf(model).map(kind => actions[kind].level))
