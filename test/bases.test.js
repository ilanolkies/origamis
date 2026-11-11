import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actions, difficultyOf } from '../src/actions/index.js'
import { collapse } from '../src/actions/collapse.js'
import { petal } from '../src/actions/petal.js'
import { reverse } from '../src/actions/reverse.js'
import { turnOver } from '../src/actions/turn.js'
import { area, check, contains, length, sheet, sub } from '../src/geometry.js'
import { DIAMOND } from '../src/models/shapes.js'
import { SQUARE } from '../src/models/things/house.js'

const L = Math.SQRT1_2
const HINGE = Math.SQRT1_2 - 1
const TIP = [0, Math.SQRT2 - 1]
const PRELIMINARY = { base: 'preliminary' }
const WATERBOMB = { base: 'waterbomb' }
const PETAL = { from: [HINGE, HINGE], to: [-HINGE, HINGE], mover: [0, -1] }
const BACK_PETAL = { ...PETAL, from: PETAL.to, to: PETAL.from }
const SINK = { from: [-1, -0.25], to: [1, -0.25], mover: [0, 0] }
const UPRIGHT = [[0, 0], [0, 1]]

const SQUARE_BASE = [[0, 0], [-0.5, -0.5], [0, -1], [0.5, -0.5]]
const TRIANGLE_BASE = [[0, 0], [-L, -L], [L, -L]]
const BIRD_BASE = [TIP, [HINGE, HINGE], [0, -1], [-HINGE, HINGE]]

const preliminary = () => collapse(sheet(DIAMOND), PRELIMINARY)
const front = () => petal(preliminary(), PETAL)
const bird = () => turnOver(petal(turnOver(front(), UPRIGHT), BACK_PETAL), UPRIGHT)
const paperOf = (faces, creases = []) => ({ faces, doodles: [], folds: [], creases, tone: 'leaf' })

const safe = (faces, sheetArea = 2) => {
  const report = check(faces, sheetArea)
  assert.ok(report.areaError < 1e-9)
  assert.equal(report.tears, 0)
  assert.equal(report.pierced, 0)
  return report
}

const inside = (faces, outline) => {
  for (const face of faces) for (const p of face.poly) assert.ok(contains(outline, p), `${p} outside`)
  for (const corner of outline) assert.ok(faces.some(face => face.poly.some(p => length(sub(p, corner)) < 1e-9)), `${corner} missing`)
}

test('a preliminary base collapses the square into a smaller square four layers thick', () => {
  const faces = preliminary()
  assert.equal(faces.length, 8)
  inside(faces, SQUARE_BASE)
  assert.equal(safe(faces).layers, 4)
  for (const p of [[-0.25, -0.5], [0.25, -0.5]]) assert.ok(faces.findLast(face => contains(face.poly, p)).colorUp)
})

test('a waterbomb base collapses the square into a triangle four layers thick', () => {
  const faces = collapse(sheet(SQUARE), WATERBOMB)
  assert.equal(faces.length, 8)
  inside(faces, TRIANGLE_BASE)
  assert.equal(safe(faces).layers, 4)
})

test('a petal fold lifts the front flap into a long point with its sides folded in on top', () => {
  const faces = front()
  const lifted = faces.slice(-4)
  for (const face of lifted) assert.ok(face.poly.some(p => length(sub(p, TIP)) < 1e-9))
  assert.deepEqual(
    lifted.map(face => face.colorUp),
    [false, false, true, true],
  )
  const point = [TIP, [HINGE, HINGE], [-HINGE, HINGE]]
  assert.ok(faces.every(face => face.poly.every(p => contains(SQUARE_BASE, p) || contains(point, p))))
  safe(faces)
})

test('petal folding both sides narrows the preliminary base into a bird base', () => {
  const faces = bird()
  inside(faces, BIRD_BASE)
  assert.equal(faces.length, 20)
  safe(faces)
})

test('a sink pushes the closed point inside and cuts the top off flat', () => {
  const faces = reverse(preliminary(), SINK)
  assert.ok(faces.every(face => face.poly.every(([, y]) => y <= -0.25 + 1e-9)))
  assert.ok(faces.some(face => face.poly.some(([x, y]) => Math.abs(x) < 1e-9 && Math.abs(y + 0.5) < 1e-9)))
  safe(faces)
})

test('a collapse keeps the creases of its base and does not repeat ones already made', () => {
  const plain = actions.collapse.perform(paperOf(sheet(DIAMOND)), { kind: 'collapse', ...PRELIMINARY }).paper
  assert.equal(plain.creases.length, 4)
  assert.deepEqual(
    plain.creases.map(crease => crease.kind).sort(),
    ['mountain', 'mountain', 'valley', 'valley'],
  )
  const halved = actions.crease.perform(paperOf(sheet(DIAMOND)), { kind: 'crease', from: [-1, 0], to: [1, 0], mover: [0, -1] }).paper
  const kept = actions.collapse.perform(halved, { kind: 'collapse', ...PRELIMINARY }).paper
  assert.equal(kept.creases.length, 4)
})

const close = (a, b) => a.forEach((p, i) => p.forEach((v, k) => assert.ok(Math.abs(v - b[i][k]) < 1e-9)))

for (const [kind, faces, action, sheetArea] of [
  ['collapse', () => sheet(DIAMOND), PRELIMINARY, 2],
  ['collapse', () => sheet(SQUARE), WATERBOMB, 2],
  ['petal', preliminary, PETAL, 2],
  ['sink', preliminary, SINK, 2],
]) {
  test(`the ${kind} animation starts from the paper and lands on the result`, () => {
    const paper = paperOf(faces())
    const { paper: done, phase } = actions[kind].perform(paper, { kind, ...action })
    const shapes = t => phase.frame(t).items.filter(item => item.type === 'face')
    const ends = shapes(1)
    assert.equal(ends.length, done.faces.length)
    ends.forEach((item, i) => {
      close(item.poly, done.faces[i].poly)
      assert.equal(item.colorUp, done.faces[i].colorUp)
    })
    const starts = shapes(0)
    const total = starts.reduce((sum, item) => sum + Math.abs(area(item.poly)), 0)
    assert.ok(Math.abs(total - sheetArea) < 1e-9)
    for (const item of starts) assert.ok(paper.faces.some(face => item.poly.every(p => contains(face.poly, p))))
    for (const t of [0.25, 0.5, 0.75]) assert.ok(shapes(t).every(item => item.poly.every(p => p.every(Number.isFinite))))
    const marks = actions[kind].marks(paper, action)
    assert.ok(marks.some(mark => mark.type === 'crease'))
    assert.ok(marks.some(mark => mark.type === 'arrow'))
  })
}

const model = actions => ({ sheet: DIAMOND, parts: [{ steps: [{ text: '', actions }] }] })

test('collapses, petal folds and sinks are level 7', () => {
  const collapsing = { kind: 'collapse', ...PRELIMINARY }
  assert.equal(difficultyOf(model([collapsing])), 8)
  assert.equal(difficultyOf(model([collapsing, { kind: 'petal', ...PETAL }])), 8)
  assert.equal(difficultyOf(model([collapsing, { kind: 'sink', ...SINK }])), 8)
})
