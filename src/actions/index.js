import { dot, length, sub } from '../geometry.js'
import { draw } from './draw.js'
import { mountain, valley } from './fold.js'
import { join } from './join.js'
import { rotate } from './rotate.js'
import { turn } from './turn.js'

export const actions = { valley, mountain, draw, join, turn, rotate }

export const LEVELS = 9

const RECTANGLE_LEVEL = 1
const ASSEMBLY_LEVEL = 2
const PAIR = 2

const stepKinds = steps => steps.flatMap(step => step.actions.map(action => action.kind))

export const kindsOf = model => [
  ...model.parts.flatMap(part => stepKinds(part.steps)),
  ...stepKinds(model.assembly?.steps ?? []),
]

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
  1 + Math.max(sheetLevel(model), assemblyLevel(model), ...kindsOf(model).map(kind => actions[kind].level))
