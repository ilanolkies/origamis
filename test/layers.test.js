import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actions, difficultyOf } from '../src/actions/index.js'
import { fold } from '../src/actions/fold.js'
import { area, check, sheet } from '../src/geometry.js'
import { DIAMOND, HALVE_UP } from '../src/models/shapes.js'

const TIP_DOWN = { from: [-1, 0.5], to: [1, 0.5], mover: [0, 1], kind: 'valley', bend: 1 }
const ACROSS = { from: [0.3, -1], to: [0.3, 1], mover: [1, 0], kind: 'valley', bend: 1 }
const LEFT_OVER = { from: [0, -1], to: [0, 1], mover: [-1, 0], kind: 'valley', bend: 1 }
const CORNER = { from: [0.5, -1], to: [0.5, 1], mover: [1, 0], kind: 'valley', bend: 1 }

const triangle = () => fold(sheet(DIAMOND), HALVE_UP).faces
const quarter = () => fold(triangle(), LEFT_OVER).faces

const safe = faces => {
  const report = check(faces, Math.abs(area(DIAMOND)))
  assert.ok(report.areaError < 1e-9)
  assert.equal(report.tears, 0)
  assert.equal(report.pierced, 0)
}

const same = (a, b) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)))

test('folding the top flap of a two-layer triangle moves only that flap', () => {
  const before = triangle()
  const result = fold(before, { ...TIP_DOWN, layers: 'top' })
  assert.equal(result.moving.length, 1)
  assert.equal(result.faces.length, 3)
  same(result.faces[0], before[0])
  assert.equal(fold(before, TIP_DOWN).moving.length, 2)
  const tip = result.faces.at(-1)
  assert.ok(tip.poly.every(([, y]) => y >= -1e-9 && y <= 0.5 + 1e-9))
  assert.equal(tip.colorUp, !before[1].colorUp)
  safe(result.faces)
})

test('a flap carries every face joined to it on the moving side', () => {
  const before = triangle()
  const top = fold(before, { ...ACROSS, layers: 'top' })
  const all = fold(before, ACROSS)
  assert.equal(top.moving.length, 2)
  same(top.faces, all.faces)
  safe(top.faces)
})

test('top layers stop where nothing joins them to the layers below', () => {
  const before = quarter()
  assert.equal(before.length, 4)
  const top = fold(before, { ...CORNER, layers: 'top' })
  assert.equal(top.moving.length, 2)
  same(top.faces.slice(0, 2), before.slice(0, 2))
  safe(top.faces)
  assert.equal(fold(before, { ...CORNER, layers: 1 }).moving.length, 2)
  assert.equal(fold(before, { ...CORNER, layers: 3 }).moving.length, 4)
  assert.equal(fold(before, CORNER).moving.length, 4)
})

test('folding the bottom layers behind leaves the top ones in place', () => {
  const before = quarter()
  const behind = fold(before, { ...CORNER, kind: 'mountain', layers: 'bottom' })
  assert.equal(behind.moving.length, 2)
  same(behind.faces.slice(-2), before.slice(-2))
  safe(behind.faces)
})

test('unfolding a top-layer fold restores the faces and creases only that layer', () => {
  const paper = { faces: triangle(), doodles: [], folds: [], creases: [], tone: 'leaf' }
  const run = (state, action) => actions[action.kind].perform(state, action).paper
  const folded = run(paper, { ...TIP_DOWN, layers: 'top' })
  const opened = run(folded, { kind: 'unfold' })
  same(opened.faces, paper.faces)
  assert.equal(opened.creases.length, 1)
  const { phase } = actions.valley.perform(paper, { ...TIP_DOWN, layers: 'top' })
  for (const t of [0, 0.5, 1]) assert.ok(phase.frame(t).items.length >= 3)
})

const model = actions => ({ sheet: DIAMOND, parts: [{ steps: [{ text: '', actions }] }] })

test('folding only some layers is level 4', () => {
  assert.equal(difficultyOf(model([HALVE_UP])), 1)
  assert.equal(difficultyOf(model([HALVE_UP, { ...TIP_DOWN, layers: 'top' }])), 5)
  assert.equal(difficultyOf(model([{ ...TIP_DOWN, kind: 'mountain', layers: 'bottom' }])), 5)
  assert.equal(difficultyOf(model([{ ...TIP_DOWN, kind: 'crease', layers: 2 }])), 5)
  assert.equal(difficultyOf(model([{ ...TIP_DOWN, kind: 'crease' }])), 4)
})
