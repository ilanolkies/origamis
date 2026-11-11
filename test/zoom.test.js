import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clampZoom, MAX_ZOOM, MIN_ZOOM, refocus, wheelZoom } from '../src/zoom.js'

test('zoom stays within its limits', () => {
  assert.equal(clampZoom(0.01), MIN_ZOOM)
  assert.equal(clampZoom(100), MAX_ZOOM)
  assert.equal(clampZoom(1.2), 1.2)
})

test('pinching out zooms in and pinching in zooms out', () => {
  assert.ok(wheelZoom(1, -10) > 1)
  assert.ok(wheelZoom(1, 10) < 1)
  assert.equal(wheelZoom(1, 0), 1)
  assert.equal(wheelZoom(MAX_ZOOM, -500), MAX_ZOOM)
})

test('the point under the fingers stays put', () => {
  const scale = 1
  const next = 2
  const focus = [300, 200]
  const scroll = [400, 400]
  const world = [scroll[0] + focus[0], scroll[1] + focus[1]]
  const [left, top] = refocus({ scale, next, focus, scroll })
  assert.deepEqual([(left + focus[0]) / next, (top + focus[1]) / next], [world[0] / scale, world[1] / scale])
})

test('zooming in and back out returns to the same scroll', () => {
  const focus = [120, 80]
  const there = refocus({ scale: 1, next: 1.7, focus, scroll: [500, 300] })
  const back = refocus({ scale: 1.7, next: 1, focus, scroll: there })
  assert.ok(Math.abs(back[0] - 500) < 1e-9 && Math.abs(back[1] - 300) < 1e-9)
})
