import assert from 'node:assert/strict'
import { test } from 'node:test'
import { crane, FINISH } from '../poc/crane/crane.js'
import { animator, build, opened } from '../poc/crane/fold3d.js'
import { statesOf } from '../poc/crane/states.js'
import { area, check } from '../src/geometry.js'

const states = statesOf(crane)
const model = build(states)
const beforeWings = states.findLastIndex(state => state.step < crane.steps.length)
model.frames.push(opened(model.frames, beforeWings, FINISH.share, FINISH.stand))
const poseAt = animator(model)
const transitions = model.frames.length - 1

const stretchOf = pose =>
  Math.max(
    ...model.mesh.springs.map(({ a, b, rest }) => {
      const gap = pose.points[a].map((value, i) => value - pose.points[b][i])
      return Math.abs(Math.hypot(...gap) - rest)
    }),
  ) / Math.SQRT2

test('the crane folds flat at every step without tearing or piercing', () => {
  const sheetArea = Math.abs(area(crane.sheet))
  for (const { faces } of states) {
    const report = check(faces, sheetArea)
    assert.ok(report.areaError < 1e-9)
    assert.equal(report.tears, 0)
    assert.equal(report.pierced, 0)
  }
})

test('every 3D keyframe, the opened crane included, is one unstretched untorn sheet', () => {
  for (let index = 0; index < transitions; index++) {
    for (const t of [0, 1]) {
      const pose = poseAt(index, t)
      assert.ok(pose.tear < 1e-9, `tear at ${index}:${t}`)
      assert.ok(stretchOf(pose) < 1e-9, `stretch at ${index}:${t}`)
    }
  }
})

test('plain folds and turns move rigidly in 3D', () => {
  const rigid = [...Array(transitions).keys()].filter(index => poseAt(index, 0.5).tear < 1e-9)
  assert.ok(rigid.length >= 8)
})

test('no edge strays more than 2% of the sheet side in the middle of collapses, petal folds and reverse folds', () => {
  for (let index = 0; index < transitions; index++) {
    for (const t of [0.25, 0.5, 0.75]) assert.ok(stretchOf(poseAt(index, t)) < 0.02, `stretch at ${index}:${t}`)
  }
})

test('the finished crane stands with its wings spread evenly to both sides', () => {
  const { points } = poseAt(transitions - 1, 1)
  const across = points.map(p => p[1])
  const tall = points.map(p => p[2])
  assert.ok(Math.max(...across) > 0.4)
  assert.ok(Math.abs(Math.max(...across) + Math.min(...across)) < 0.05)
  assert.ok(Math.max(...tall) - Math.min(...tall) > 0.5)
})
