import assert from 'node:assert/strict'
import { test } from 'node:test'
import { difficultyOf, piecesOf } from '../src/actions/index.js'
import { fold } from '../src/actions/fold.js'
import { add, apply, polar, sheet } from '../src/geometry.js'
import { DIAMOND, HALVE_UP } from '../src/models/shapes.js'
import { models } from '../src/models/index.js'
import { placement } from '../src/scene.js'
import { buildTimeline } from '../src/timeline.js'

const SIDE = { from: [0, -1], to: [0, 1], mover: [-1, 0], kind: 'valley' }
const strokes = [[[0, 0.2], [0.1, 0.3]]]

const part = (id, actions, extra = {}) => ({
  id,
  name: id,
  kanji: id,
  tone: 'leaf',
  paper: '',
  ...extra,
  steps: [{ text: id, actions }],
})
const join = (part, where = {}) => ({ kind: 'join', part, ...where })
const folded = crease => fold(sheet(DIAMOND), crease).faces

const near = (a, b) => {
  assert.ok(Math.abs(a[0] - b[0]) < 1e-9, `${a} != ${b}`)
  assert.ok(Math.abs(a[1] - b[1]) < 1e-9, `${a} != ${b}`)
}

const samePolys = (items, faces, move) => {
  assert.equal(items.length, faces.length)
  items.forEach((item, i) => {
    assert.equal(item.type, 'face')
    item.poly.forEach((p, k) => near(p, move(faces[i].poly[k])))
  })
}

const threePieces = {
  id: 'three',
  sheet: DIAMOND,
  parts: [part('a', [HALVE_UP]), part('b', [SIDE]), part('c', [HALVE_UP, SIDE])],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'a' },
    steps: [
      { text: 'b', actions: [join('b', { seat: [0.5, 1] })] },
      { text: 'c', actions: [join('c', { seat: [-1, 2] }), { kind: 'draw', strokes }] },
    ],
  },
}

const blossom = {
  id: 'blossom',
  sheet: DIAMOND,
  parts: [part('petal', [HALVE_UP, SIDE], { copies: 6 })],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'petal', seat: polar(90) },
    steps: [
      {
        text: 'petals',
        actions: [1, 2, 3, 4].map(k => join('petal', { seat: polar(90 + 72 * k), rotate: 72 * k })),
      },
      { text: 'mirror', actions: [join('petal', { seat: [3, 0], mirror: true, scale: 0.5 })] },
    ],
  },
}

test('assembling three pieces places every face at its seat', () => {
  const timeline = buildTimeline(threePieces)
  const a = folded(HALVE_UP)
  const b = folded(SIDE)
  const c = fold(folded(HALVE_UP), SIDE).faces
  const after = timeline.steps.at(-1).after
  const faces = after.filter(item => item.type === 'face')
  assert.equal(faces.length, a.length + b.length + c.length)
  samePolys(faces.slice(0, a.length), a, p => p)
  samePolys(faces.slice(a.length, a.length + b.length), b, p => add(p, [0.5, 1]))
  samePolys(faces.slice(a.length + b.length), c, p => add(p, [-1, 2]))
  assert.deepEqual(after.at(-1).strokes, strokes)
  assert.equal(timeline.steps.length, 5)
  assert.deepEqual(timeline.sections.at(-1).paper, 'All 3 pieces')
  assert.equal(timeline.sections.at(-1).steps.length, 2)
})

test('assembly phases run from the start to the end of each step', () => {
  const timeline = buildTimeline(threePieces)
  for (const step of timeline.sections.at(-1).steps) {
    for (const phase of step.phases) {
      for (const t of [0, 0.5, 1]) assert.ok(phase.frame(t).items.length >= step.start.length)
    }
  }
  assert.deepEqual(timeline.steps.at(-1).marks.map(mark => mark.guide), [true])
})

test('a repeated module is folded once and placed with its transforms', () => {
  const timeline = buildTimeline(blossom)
  const petal = fold(folded(HALVE_UP), SIDE).faces
  assert.equal(timeline.steps.length, 1 + 2)
  assert.equal(piecesOf(blossom), 6)
  const faces = timeline.steps.at(-1).after
  assert.equal(faces.length, 6 * petal.length)
  for (let k = 0; k < 5; k++) {
    const turn = placement({ seat: polar(90 + 72 * k), rotate: 72 * k })
    samePolys(faces.slice(k * petal.length, (k + 1) * petal.length), petal, p => apply(turn, p))
    near(apply(turn, [0, -1]), [0, 0])
  }
  samePolys(faces.slice(5 * petal.length), petal, p => [3 - p[0] / 2, p[1] / 2])
  assert.equal(timeline.steps[1].phases.length, 4)
})

test('more than two pieces or a repeated module is level 2', () => {
  assert.equal(difficultyOf(threePieces), 3)
  assert.equal(difficultyOf(blossom), 3)
  const pair = {
    ...threePieces,
    parts: threePieces.parts.slice(0, 2),
    assembly: { ...threePieces.assembly, steps: threePieces.assembly.steps.slice(0, 1) },
  }
  assert.equal(difficultyOf(pair), 1)
})

const EXISTING = {
  tulip: 1, leaf: 1, stem: 1, cat: 1, dog: 1, whale: 4,
  'cat-face': 1, 'dog-face': 1, 'fox-face': 1, 'rabbit-face': 1, 'pig-face': 1,
  watermelon: 2, onigiri: 1, carrot: 1, 'ice-cream': 2, nigiri: 2,
  sailboat: 1, rocket: 1, fuji: 1, sunflower: 4,
}

test('existing models keep their difficulty', () => {
  for (const [id, difficulty] of Object.entries(EXISTING)) {
    assert.equal(difficultyOf(models.find(model => model.id === id)), difficulty, id)
  }
})
