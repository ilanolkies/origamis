import { dot, length, sub } from '../geometry.js'
import { draw } from './draw.js'
import { crease, mountain, unfold, valley } from './fold.js'
import { join } from './join.js'
import { insideReverse, outsideReverse } from './reverse.js'
import { rotate } from './rotate.js'
import { squashAction } from './squash.js'
import { turn } from './turn.js'

export const actions = {
  valley,
  mountain,
  unfold,
  crease,
  draw,
  join,
  turn,
  rotate,
  squash: squashAction,
  'inside-reverse': insideReverse,
  'outside-reverse': outsideReverse,
}

export const LEVELS = 9

const RECTANGLE_LEVEL = 1
const ASSEMBLY_LEVEL = 2
const PAIR = 2

const stepActions = steps => steps.flatMap(step => step.actions)

export const actionsOf = model => [
  ...model.parts.flatMap(part => stepActions(part.steps)),
  ...stepActions(model.assembly?.steps ?? []),
]

export const kindsOf = model => actionsOf(model).map(action => action.kind)

const levelOf = action => {
  const { level } = actions[action.kind]
  return typeof level === 'function' ? level(action) : level
}

export const piecesOf = model => model.parts.reduce((count, part) => count + (part.copies ?? 1), 0)

export const isSquare = corners =>
  corners.length === 4 &&
  corners.every((corner, i) => {
    const next = corners[(i + 1) % 4]
    const side = sub(next, corner)
    const following = sub(corners[(i + 2) % 4], next)
    return Math.abs(length(side) - length(following)) < 1e-9 && Math.abs(dot(side, following)) < 1e-9
  })

const sheetLevel = model => (isSquare(model.sheet) ? 0 : RECTANGLE_LEVEL)

const repeats = model => model.parts.some(part => (part.copies ?? 1) > 1)

const assemblyLevel = model => (piecesOf(model) > PAIR || repeats(model) ? ASSEMBLY_LEVEL : 0)

export const difficultyOf = model =>
  1 + Math.max(sheetLevel(model), assemblyLevel(model), ...actionsOf(model).map(levelOf))
