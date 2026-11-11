import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actions, difficultyOf } from '../src/actions/index.js'
import { area, sheet } from '../src/geometry.js'
import { DIAMOND, HALVE_UP } from '../src/models/shapes.js'
import { linesOf, scene } from '../src/scene.js'
import { buildTimeline } from '../src/timeline.js'

const SIDE = { from: [0, -1], to: [0, 1], mover: [-1, 0], kind: 'valley', bend: 1 }
const start = () => ({ faces: sheet(DIAMOND), doodles: [], folds: [], tone: 'leaf' })
const run = (paper, ...list) => list.reduce((state, action) => actions[action.kind].perform(state, action).paper, paper)

const near = (a, b) => {
  assert.ok(Math.abs(a[0] - b[0]) < 1e-9, `${a} != ${b}`)
  assert.ok(Math.abs(a[1] - b[1]) < 1e-9, `${a} != ${b}`)
}

const sameSegment = (line, from, to) => {
  const [a, b] = Math.abs(line.from[0] - from[0]) + Math.abs(line.from[1] - from[1]) < 1e-9 ? [from, to] : [to, from]
  near(line.from, a)
  near(line.to, b)
}

const sameFaces = (actual, expected) => {
  assert.equal(actual.length, expected.length)
  actual.forEach((face, i) => {
    assert.equal(face.colorUp, expected[i].colorUp)
    assert.ok(Math.abs(area(face.poly) - area(expected[i].poly)) < 1e-9)
    face.poly.forEach((p, k) => near(p, expected[i].poly[k]))
    face.matrix.forEach((v, k) => assert.ok(Math.abs(v - expected[i].matrix[k]) < 1e-9))
  })
}

test('folding then unfolding returns the original faces', () => {
  const paper = start()
  sameFaces(run(paper, HALVE_UP, { kind: 'unfold' }).faces, paper.faces)
  const twice = run(paper, HALVE_UP, SIDE)
  sameFaces(run(twice, { kind: 'unfold' }).faces, run(paper, HALVE_UP).faces)
  sameFaces(run(twice, { kind: 'unfold' }, { kind: 'unfold' }).faces, paper.faces)
  sameFaces(run(paper, { ...HALVE_UP, kind: 'crease' }).faces, paper.faces)
})

test('unfolding after a turn or rotate opens the flap where it now lies', () => {
  const paper = start()
  const turned = run(paper, HALVE_UP, { kind: 'turn' }, { kind: 'unfold' })
  sameFaces(turned.faces, run(paper, { kind: 'turn' }).faces)
  const spun = run(paper, HALVE_UP, { kind: 'rotate', degrees: 90 }, { kind: 'unfold' })
  const quarter = [0, -1, 0.5, 1, 0, 0.5]
  sameFaces(spun.faces, [{ poly: DIAMOND.map(([x, y]) => [0.5 - y, x + 0.5]), matrix: quarter, colorUp: false }])
})

test('an unfolded fold leaves its crease on the paper', () => {
  const paper = run(start(), { ...HALVE_UP, kind: 'crease' })
  const [lines] = scene(paper.faces, paper).map(item => item.lines)
  assert.equal(lines.length, 1)
  sameSegment(lines[0], [-1, 0], [1, 0])
  assert.equal(lines[0].kind, 'valley')
  assert.equal(run(start(), { ...HALVE_UP, kind: 'mountain' }, { kind: 'unfold' }).creases[0].kind, 'mountain')
})

test('kept creases follow later rotates, turns and folds', () => {
  let paper = run(start(), { ...HALVE_UP, kind: 'crease' }, { kind: 'rotate', degrees: 90 })
  sameSegment(linesOf(paper.faces[0], paper.creases)[0], [0, -1], [0, 1])

  paper = run(paper, { kind: 'turn' })
  const [turned] = linesOf(paper.faces[0], paper.creases)
  sameSegment(turned, [0, -1], [0, 1])
  assert.equal(turned.kind, 'mountain')

  paper = run(paper, HALVE_UP)
  const [stay, flap] = paper.faces.map(face => linesOf(face, paper.creases))
  sameSegment(stay[0], [0, 0], [0, 1])
  assert.equal(stay[0].kind, 'mountain')
  sameSegment(flap[0], [0, 0], [0, 1])
  assert.equal(flap[0].kind, 'valley')

  paper = run(paper, SIDE)
  const lines = paper.faces.flatMap(face => linesOf(face, paper.creases))
  assert.equal(lines.length, 4)
  for (const line of lines) sameSegment(line, [0, 0], [0, 1])
})

test('creases through several layers are kept on each layer', () => {
  const paper = run(start(), HALVE_UP, { ...SIDE, kind: 'crease' })
  assert.equal(paper.faces.length, 2)
  for (const face of paper.faces) sameSegment(linesOf(face, paper.creases)[0], [0, 0], [0, 1])
  const opened = run(paper, { kind: 'unfold' })
  const lines = opened.faces.flatMap(face => linesOf(face, opened.creases))
  assert.equal(lines.length, 3)
  sameSegment(lines[0], [0, 0], [0, 1])
  sameSegment(lines[1], [0, -1], [0, 0])
  sameSegment(lines[2], [-1, 0], [1, 0])
  assert.deepEqual(lines.map(line => line.kind), ['valley', 'mountain', 'valley'])
})

const model = {
  id: 'precrease',
  sheet: DIAMOND,
  parts: [
    {
      id: 'sheet',
      name: 'Sheet',
      kanji: '紙',
      tone: 'leaf',
      paper: '',
      steps: [
        { text: 'Fold in half.', actions: [HALVE_UP] },
        { text: 'Unfold.', actions: [{ kind: 'unfold' }] },
        { text: 'Crease the other way.', actions: [{ ...SIDE, kind: 'crease' }] },
      ],
    },
  ],
}

test('unfold steps play the flap back and keep the crease in view', () => {
  const timeline = buildTimeline(model)
  const [, unfold, crease] = timeline.steps
  assert.equal(unfold.phases.length, 1)
  assert.equal(crease.phases.length, 2)
  assert.ok(unfold.marks.some(mark => mark.type === 'arrow'))
  for (const phase of [...unfold.phases, ...crease.phases]) {
    for (const t of [0, 0.5, 1]) assert.ok(phase.frame(t).items.length >= 1)
  }
  const after = timeline.steps.at(-1).after
  assert.equal(after.length, 1)
  assert.equal(after[0].lines.length, 2)
})

test('a model that unfolds is level 4', () => {
  assert.equal(difficultyOf(model), 4)
})
