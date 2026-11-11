import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actions, difficultyOf } from '../src/actions/index.js'
import { fold } from '../src/actions/fold.js'
import { turnOver } from '../src/actions/turn.js'
import { area, check, length, sheet, sub } from '../src/geometry.js'
import { DIAMOND, HALVE_UP } from '../src/models/shapes.js'

const RIM = 2 - Math.SQRT2
const HINGE = (Math.SQRT2 - 1) ** 2
const REACH = Math.SQRT2 - 1
const POINT = [0, HINGE]

const TIP_DOWN = { from: [-1, 0.5], to: [1, 0.5], mover: [0, 1], kind: 'valley', bend: 1, layers: 'top' }
const TIP_BEHIND = { ...TIP_DOWN, kind: 'mountain', layers: 'bottom' }
const TIP_INSIDE = { ...TIP_DOWN, layers: 'bottom', into: 'inside' }
const across = side => ({ from: [side * HINGE, 0], to: [side * REACH, RIM], mover: [side, 0], kind: 'valley', bend: 1 })
const FLAP = { from: [-1, RIM], to: [1, RIM], mover: [0, 1], kind: 'valley', bend: 1, layers: 'top' }

const triangle = () => fold(sheet(DIAMOND), HALVE_UP).faces
const pockets = () => fold(fold(triangle(), across(1)).faces, across(-1)).faces
const report = faces => check(faces, Math.abs(area(DIAMOND)))
const paperOf = faces => ({ faces, doodles: [], folds: [], creases: [], tone: 'leaf' })

const tip = faces =>
  faces.findIndex(
    face => face.poly.every(([, y]) => y <= 0.5 + 1e-6 && y >= -1e-6) && Math.abs(area(face.poly)) < 0.3,
  )
const flap = faces => faces.findIndex(face => face.poly.some(p => length(sub(p, POINT)) < 1e-9))

const safe = faces => {
  const { areaError, tears, pierced } = report(faces)
  assert.ok(areaError < 1e-9)
  assert.equal(tears, 0)
  assert.equal(pierced, 0)
}

test('a tucked flap lands under the requested number of layers', () => {
  const before = pockets()
  assert.equal(before.length, 6)
  assert.equal(flap(fold(before, FLAP).faces), 6)
  for (const [into, depth] of [[1, 5], [2, 4], [3, 3], [4, 2]]) {
    const faces = fold(before, { ...FLAP, into }).faces
    assert.equal(flap(faces), depth, `into ${into}`)
    assert.equal(faces.length, 7)
    safe(faces)
  }
})

test('a flap folded behind can be tucked above the bottom layers', () => {
  const before = turnOver(pockets(), [[0, 0], [0, 1]])
  const behind = { ...FLAP, kind: 'mountain', layers: 'bottom' }
  assert.equal(flap(fold(before, behind).faces), 0)
  const tucked = fold(before, { ...behind, into: 1 }).faces
  assert.equal(flap(tucked), 1)
  safe(tucked)
})

test('a flap tucked inside lies right against its own layer', () => {
  const before = triangle()
  const inside = fold(before, TIP_INSIDE).faces
  assert.equal(tip(fold(before, { ...TIP_INSIDE, into: undefined }).faces), 2)
  assert.equal(tip(inside), 1)
  assert.deepEqual(inside[2], before[1])
  safe(inside)
  const front = fold(before, { ...TIP_DOWN, kind: 'mountain', into: 'inside' }).faces
  assert.equal(tip(front), 1)
  assert.deepEqual(front[0], before[0])
  safe(front)
  assert.equal(flap(fold(pockets(), { ...FLAP, into: 'inside' }).faces), 2)
})

test('a tuck never passes through its own layer, where it would pierce', () => {
  const before = triangle()
  const plain = fold(before, TIP_DOWN).faces
  assert.deepEqual(fold(before, { ...TIP_DOWN, into: 2 }).faces, plain)
  assert.deepEqual(fold(before, { ...TIP_BEHIND, into: 1 }).faces, fold(before, TIP_BEHIND).faces)
  assert.deepEqual(fold(pockets(), { ...FLAP, into: 9 }).faces, fold(pockets(), { ...FLAP, into: 4 }).faces)
  const through = [plain[2], plain[0], plain[1]]
  assert.ok(report(through).pierced > 0)
})

test('the tuck animation ends with the flap in the pocket and marks a tucking arrow', () => {
  const paper = paperOf(triangle())
  const facesAt = action => actions.valley.perform(paper, action).phase.frame(1).items.filter(item => item.type === 'face')
  assert.equal(tip(facesAt(TIP_INSIDE)), 1)
  assert.equal(tip(facesAt({ ...TIP_INSIDE, into: undefined })), 2)
  const arrows = actions.valley.marks(paper, TIP_INSIDE).filter(mark => mark.type === 'arrow')
  assert.deepEqual(arrows.map(arrow => arrow.under), [true])
  assert.deepEqual(actions.valley.marks(paper, TIP_DOWN).filter(mark => mark.under), [])
})

test('unfolding a tuck restores the faces', () => {
  const paper = paperOf(pockets())
  const tucked = actions.valley.perform(paper, { ...FLAP, into: 1 }).paper
  assert.deepEqual(actions.unfold.perform(tucked, { kind: 'unfold' }).paper.faces, paper.faces)
})

const model = actions => ({ sheet: DIAMOND, parts: [{ steps: [{ text: '', actions }] }] })

test('tucking is level 5', () => {
  assert.equal(difficultyOf(model([HALVE_UP, TIP_DOWN])), 5)
  assert.equal(difficultyOf(model([HALVE_UP, { ...TIP_DOWN, into: 1 }])), 6)
  assert.equal(difficultyOf(model([HALVE_UP, TIP_INSIDE])), 6)
})
