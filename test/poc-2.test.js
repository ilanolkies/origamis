import assert from 'node:assert/strict'
import { test } from 'node:test'
import { models } from '../poc-2/models.js'
import { crease, pose, sheet, THICKNESS, timeline } from '../poc-2/paper.js'

const SQUARE = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]
const HALF = { from: [0, -1], to: [0, 1] }

const area = points =>
  Math.abs(points.reduce((sum, [x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length]
    return sum + x * ny - nx * y
  }, 0)) / 2

const final = model => pose(timeline(model).at(-1))
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≉ ${expected}`)

test('a valley fold lands the left half on top of the right half', () => {
  const faces = pose(crease(sheet([SQUARE]), { ...HALF, angle: 180 }))
  assert.equal(faces.length, 2)
  for (const [x, , z] of faces[1].at) {
    assert.ok(x > -1e-9)
    near(z, THICKNESS)
  }
})

test('a mountain fold lands it underneath', () => {
  const faces = pose(crease(sheet([SQUARE]), { ...HALF, angle: -180 }))
  for (const point of faces[1].at) near(point[2], -THICKNESS)
})

test('a fold can stop at any angle', () => {
  const faces = pose(crease(sheet([SQUARE]), { ...HALF, angle: 90 }))
  const tip = faces[1].at.find((_, i) => faces[1].uv[i][0] === -0.5)
  near(tip[2], 0.5 + THICKNESS / 2)
})

test('half way through a fold is half the angle', () => {
  const faces = pose(crease(sheet([SQUARE]), { ...HALF, angle: 180 }), 0.5)
  const tip = faces[1].at.find((_, i) => faces[1].uv[i][0] === -0.5)
  near(tip[2], 0.5 + THICKNESS / 2)
})

test('a second flat fold stacks every layer in order', () => {
  let faces = pose(crease(sheet([SQUARE]), { ...HALF, angle: 180 }))
  faces = pose(crease(faces, { from: [1, 0], to: [-1, 0], angle: 180 }))
  const heights = [...new Set(faces.map(face => Math.round(face.at[0][2] / THICKNESS)))]
  assert.deepEqual(heights.sort(), [0, 1, 2, 3])
})

for (const model of models) {
  test(`${model.name} never stretches or loses paper`, () => {
    const before = model.sheet.reduce((sum, polygon) => sum + area(polygon), 0)
    near(final(model).reduce((sum, face) => sum + area(face.uv), 0), before)
    for (const { uv, at } of final(model)) {
      uv.forEach((corner, i) => {
        const j = (i + 1) % uv.length
        near(Math.hypot(...at[i].map((v, k) => v - at[j][k])), Math.hypot(corner[0] - uv[j][0], corner[1] - uv[j][1]))
      })
    }
  })
}

test('the cube closes into a box', () => {
  const cube = models.find(model => model.id === 'cube')
  const faces = final(cube)
  const side = area(cube.sheet[0]) ** 0.5
  assert.equal(faces.length, 6)
  const zs = faces.flatMap(face => face.at.map(point => point[2]))
  assert.ok(Math.min(...zs) > -THICKNESS && Math.max(...zs) < side + 2 * THICKNESS)
  const lid = faces.filter(face => face.at.every(point => point[2] > side - THICKNESS))
  assert.equal(lid.length, 1)
})
