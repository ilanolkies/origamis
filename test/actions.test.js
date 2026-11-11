import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actions, difficultyOf } from '../src/actions/index.js'
import { fold } from '../src/actions/fold.js'
import { area, check, sheet } from '../src/geometry.js'
import { DIAMOND, HALVE_UP } from '../src/models/shapes.js'

const paperOf = faces => ({ faces, doodles: [], tone: 'paper' })
const perform = (faces, action) => actions[action.kind].perform(paperOf(faces), action).paper.faces

const close = (actual, expected) => {
  assert.equal(actual.length, expected.length)
  actual.forEach((face, i) => {
    assert.equal(face.colorUp, expected[i].colorUp)
    face.matrix.forEach((v, k) => assert.ok(Math.abs(v - expected[i].matrix[k]) < 1e-9))
    face.poly.forEach((p, k) => {
      assert.ok(Math.abs(p[0] - expected[i].poly[k][0]) < 1e-9)
      assert.ok(Math.abs(p[1] - expected[i].poly[k][1]) < 1e-9)
    })
  })
}

const folded = () => {
  let faces = sheet(DIAMOND)
  faces = fold(faces, HALVE_UP).faces
  faces = fold(faces, { from: [0.3, 0], to: [0.3, 1], mover: [1, 0], kind: 'valley' }).faces
  return fold(faces, { from: [-1, 0.6], to: [1, 0.6], mover: [0, 1], kind: 'mountain' }).faces
}

const safe = faces => {
  const report = check(faces, Math.abs(area(DIAMOND)))
  assert.ok(report.areaError < 1e-9)
  assert.equal(report.tears, 0)
  assert.equal(report.pierced, 0)
}

const RECTANGLE = [[-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5]]
const model = (sheet, kinds) => ({
  sheet,
  parts: [{ steps: [{ text: '', actions: kinds.map(kind => ({ kind })) }] }],
})

test('turning over twice restores the faces', () => {
  const faces = folded()
  close(perform(perform(faces, { kind: 'turn' }), { kind: 'turn' }), faces)
})

test('turning over along a given axis twice restores the faces', () => {
  const faces = folded()
  const turn = { kind: 'turn', from: [0, 0.2], to: [1, 0.5] }
  close(perform(perform(faces, turn), turn), faces)
})

test('turning over flips colours and reverses the stack', () => {
  const faces = folded()
  const turned = perform(faces, { kind: 'turn' })
  assert.deepEqual(
    turned.map(face => face.colorUp),
    faces.map(face => !face.colorUp).reverse(),
  )
})

test('turning over hides the doodles', () => {
  const paper = { ...paperOf(folded()), doodles: [{ type: 'doodle', strokes: [[[0, 0], [0.1, 0]]], progress: 1 }] }
  assert.deepEqual(actions.turn.perform(paper, { kind: 'turn' }).paper.doodles, [])
})

test('rotating a full turn restores the faces', () => {
  const faces = folded()
  close(perform(faces, { kind: 'rotate', degrees: 360 }), faces)
  let turned = faces
  for (let i = 0; i < 4; i++) turned = perform(turned, { kind: 'rotate', degrees: 90 })
  close(turned, faces)
})

test('turn and rotate keep the area and the folds intact', () => {
  let faces = folded()
  faces = perform(faces, { kind: 'turn' })
  safe(faces)
  faces = perform(faces, { kind: 'rotate', degrees: 90 })
  safe(faces)
  faces = fold(faces, { from: [-1, -0.2], to: [1, -0.2], mover: [0, -1], kind: 'valley' }).faces
  safe(faces)
  faces = perform(faces, { kind: 'turn', from: [0, 0], to: [1, 1] })
  safe(faces)
})

test('turn and rotate phases run from start to end', () => {
  const paper = paperOf(folded())
  for (const action of [{ kind: 'turn' }, { kind: 'rotate', degrees: 90 }]) {
    const { phase } = actions[action.kind].perform(paper, action)
    for (const t of [0, 0.5, 1]) assert.ok(phase.frame(t).items.length >= paper.faces.length)
    assert.ok(actions[action.kind].marks(paper, action).length > 0)
  }
})

test('turn, rotate and rectangle sheets are level 1', () => {
  assert.equal(difficultyOf(model(DIAMOND, ['valley'])), 1)
  assert.equal(difficultyOf(model(DIAMOND, ['valley', 'turn'])), 2)
  assert.equal(difficultyOf(model(DIAMOND, ['rotate'])), 2)
  assert.equal(difficultyOf(model(RECTANGLE, ['valley'])), 2)
  assert.equal(difficultyOf(model([[-1, -1], [1, -1], [1, 1], [-1, 1]], ['valley'])), 1)
})
