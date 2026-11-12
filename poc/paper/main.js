import { createView } from '../crane/view.js'
import { folding, poseOf, sheet } from './paper.js'

const FOLDED = 0.985 * Math.PI
const FRAMES = 90
const SECONDS = 2.4
const REST = 1.2
const FLAT = [0, 0, 0, 0, 0, 0, 0, 0]
const BASE = [0, -FOLDED, FOLDED, -FOLDED, 0, -FOLDED, FOLDED, -FOLDED]

const path = folding(FLAT, BASE, FRAMES)
const canvas = document.querySelector('#scene')
const draw = createView(canvas)
const look = { yaw: -1.1, pitch: 0.75, held: false }
const ease = t => t * t * (3 - 2 * t)

const tick = now => {
  const cycle = (now / 1000) % (2 * (SECONDS + REST))
  const there = Math.min(1, cycle / SECONDS)
  const back = Math.min(1, Math.max(0, (cycle - SECONDS - REST) / SECONDS))
  const frame = Math.round(ease(there - back) * FRAMES)
  draw(poseOf(path[frame]), sheet, { yaw: look.yaw, pitch: look.pitch, target: [0, -0.2, 0.15], radius: 1.25 })
  requestAnimationFrame(tick)
}

canvas.addEventListener('pointerdown', event => {
  look.held = true
  canvas.setPointerCapture(event.pointerId)
})
canvas.addEventListener('pointermove', event => {
  if (!look.held) return
  look.yaw -= event.movementX * 0.008
  look.pitch = Math.min(1.5, Math.max(0.06, look.pitch + event.movementY * 0.006))
})
for (const kind of ['pointerup', 'pointercancel']) canvas.addEventListener(kind, () => (look.held = false))

requestAnimationFrame(tick)
