import assert from 'node:assert/strict'
import { test } from 'node:test'
import { folding, gap, poseOf, sheet } from '../poc/paper/paper.js'

const FOLDED = 0.985 * Math.PI
const FLAT = [0, 0, 0, 0, 0, 0, 0, 0]
const BASE = [0, -FOLDED, FOLDED, -FOLDED, 0, -FOLDED, FOLDED, -FOLDED]
const path = folding(FLAT, BASE, 90)

test('the sheet stays one closed piece of paper on every frame of the collapse', () => {
  for (const angles of path) assert.ok(Math.max(...gap(angles).map(Math.abs)) < 1e-9)
})

test('the collapse ends at the preliminary base with its front and back squares left plain', () => {
  const end = path.at(-1)
  end.forEach((angle, crease) => assert.ok(Math.abs(angle - BASE[crease]) < 0.03))
  assert.equal(end[0], 0)
  assert.equal(end[4], 0)
})

test('no face changes shape while folding', () => {
  const sides = points => points.map((p, i) => Math.hypot(...p.map((v, k) => v - points[(i + 1) % 3][k])))
  const flat = sheet.faces.map(sides)
  for (const angles of path) {
    poseOf(angles).faces.forEach(({ points }, face) =>
      sides(points).forEach((side, i) => assert.ok(Math.abs(side - flat[face][i]) < 1e-9)),
    )
  }
})
