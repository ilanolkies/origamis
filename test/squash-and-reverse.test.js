import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actions, difficultyOf } from '../src/actions/index.js'
import { fold } from '../src/actions/fold.js'
import { reverse } from '../src/actions/reverse.js'
import { squash } from '../src/actions/squash.js'
import { area, check, contains, sheet } from '../src/geometry.js'
import { DIAMOND, HALVE_UP } from '../src/models/shapes.js'

const LEANS_IN = { from: [0.5, 0], to: [0.75, 0.25], mover: [1, 0], bend: 1 }
const LEANS_OUT = { from: [0.5, 0], to: [0.4, 0.1], mover: [1, 0], bend: 1 }
const HALVE_SIDE = { from: [0, -1], to: [0, 1], mover: [1, 0], kind: 'valley' }
const FLAP = { from: [0, 0], to: [0, 1], mover: [-0.9, 0.05], diagonal: [[0, 0], [-0.5, 0.5]] }

const triangle = () => fold(sheet(DIAMOND), HALVE_UP).faces
const quarter = () => fold(triangle(), HALVE_SIDE).faces
const report = faces => check(faces, Math.abs(area(DIAMOND)))
const paperOf = faces => ({ faces, doodles: [], folds: [], creases: [], tone: 'leaf' })

const key = poly =>
  poly
    .map(p => p.map(v => (Math.abs(v) < 1e-9 ? 0 : v).toFixed(6)).join(','))
    .sort()
    .join(' ')
const samePoly = (actual, expected) => assert.equal(key(actual), key(expected))

const safe = faces => {
  const { areaError, tears, pierced } = report(faces)
  assert.ok(areaError < 1e-9)
  assert.equal(tears, 0)
  assert.equal(pierced, 0)
}

const TIP = [[0.5, 0], [0.5, 0.5], [0.75, 0.25]]
const BODY = [[-1, 0], [0.5, 0], [0.75, 0.25], [0, 1]]

test('an inside reverse fold turns the point up between the two layers', () => {
  const before = triangle()
  const faces = reverse(before, LEANS_IN)
  assert.equal(faces.length, 4)
  samePoly(faces[0].poly, BODY)
  samePoly(faces[1].poly, TIP)
  samePoly(faces[2].poly, TIP)
  samePoly(faces[3].poly, BODY)
  assert.deepEqual(
    faces.map(face => face.colorUp),
    [before[0].colorUp, !before[0].colorUp, !before[1].colorUp, before[1].colorUp],
  )
  safe(faces)
})

test('an outside reverse fold wraps the point around both layers', () => {
  const faces = reverse(triangle(), LEANS_OUT, true)
  const tip = [[0.5, 0], [0.5, -0.5], [-0.5, 0.5], [-0.25, 0.75]]
  const body = [[-1, 0], [0.5, 0], [-0.25, 0.75]]
  samePoly(faces[0].poly, tip)
  samePoly(faces[1].poly, body)
  samePoly(faces[2].poly, body)
  samePoly(faces[3].poly, tip)
  safe(faces)
})

test('a reverse fold only works on the side its crease leans to', () => {
  assert.ok(report(reverse(triangle(), LEANS_IN, true)).pierced > 0)
  assert.ok(report(reverse(triangle(), LEANS_OUT)).pierced > 0)
})

test('a reverse fold moves only the point, even where its crease line crosses the body', () => {
  const necked = reverse(triangle(), LEANS_IN)
  const head = { from: [0.5, 0.35], to: [0.5 + Math.sqrt(3) / 2, 0.85], mover: [0.5, 0.5] }
  const faces = reverse(necked, head)
  assert.equal(faces.length, 6)
  samePoly(faces[0].poly, BODY)
  samePoly(faces.at(-1).poly, BODY)
  assert.ok(faces.slice(1, -1).every(face => face.poly.every(([x, y]) => x >= 0.5 - 1e-9 && y >= -1e-9)))
  safe(faces)
})

test('squashing a flap opens it into a square centred on its hinge', () => {
  const before = quarter()
  const faces = squash(before, FLAP)
  assert.equal(faces.length, 6)
  assert.deepEqual(faces.slice(0, 2), before.slice(0, 2))
  const flap = faces.slice(2)
  const left = flap.filter(face => face.poly.every(([x]) => x <= 1e-9))
  const right = flap.filter(face => face.poly.every(([x]) => x >= -1e-9))
  assert.equal(left.length, 2)
  assert.equal(right.length, 2)
  for (const face of left) samePoly(face.poly, [[0, 0], [0, 1], [-0.5, 0.5]])
  for (const face of right) samePoly(face.poly, [[0, 0], [0, 1], [0.5, 0.5]])
  safe(faces)
})

const close = (a, b) => a.forEach((p, i) => p.forEach((v, k) => assert.ok(Math.abs(v - b[i][k]) < 1e-9)))

for (const [kind, faces, action] of [
  ['inside-reverse', triangle, LEANS_IN],
  ['outside-reverse', triangle, LEANS_OUT],
  ['squash', quarter, FLAP],
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
    assert.ok(Math.abs(total - Math.abs(area(DIAMOND))) < 1e-9)
    for (const item of starts) assert.ok(paper.faces.some(face => item.poly.every(p => contains(face.poly, p))))
    for (const t of [0.25, 0.5, 0.75]) assert.ok(shapes(t).every(item => item.poly.every(p => p.every(Number.isFinite))))
  })
}

test('reverse folds mark the crease on the front layer and push the point in or around', () => {
  const paper = paperOf(triangle())
  const inside = actions['inside-reverse'].marks(paper, LEANS_IN)
  const outside = actions['outside-reverse'].marks(paper, LEANS_OUT)
  assert.deepEqual(inside.map(mark => mark.kind ?? mark.under), ['mountain', true])
  assert.deepEqual(outside.map(mark => mark.kind ?? mark.under), ['valley', false])
  close([inside[1].to], [[0.5, 0.5]])
  const squashing = actions.squash.marks(paperOf(quarter()), FLAP)
  assert.deepEqual(squashing.map(mark => mark.type), ['crease', 'arrow'])
})

const model = actions => ({ sheet: DIAMOND, parts: [{ steps: [{ text: '', actions }] }] })

test('squash and reverse folds are level 6', () => {
  assert.equal(difficultyOf(model([HALVE_UP, { kind: 'inside-reverse', ...LEANS_IN }])), 7)
  assert.equal(difficultyOf(model([HALVE_UP, { kind: 'outside-reverse', ...LEANS_OUT }])), 7)
  assert.equal(difficultyOf(model([HALVE_UP, HALVE_SIDE, { kind: 'squash', ...FLAP }])), 7)
})
