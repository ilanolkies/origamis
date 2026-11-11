import { crane, FINISH } from './crane.js'
import { animator, build, opened } from './fold3d.js'
import { statesOf } from './states.js'
import { cameraOf, renderPose } from './view.js'
import { add3, scale3, sub3 } from './vec.js'

const SECONDS = 1.5
const PAUSE = 0.55
const BOIL = 140
const DOWN = (62 * Math.PI) / 180
const LEVEL = (16 * Math.PI) / 180
const YAW = (-62 * Math.PI) / 180
const SPIN = 0.3

const states = statesOf(crane)
const model = build(states)
const wings = crane.steps.length
model.frames.push(opened(model.frames, states.findLastIndex(state => state.step < wings), FINISH.share, FINISH.stand))
const poseAt = animator(model)

const last = model.frames.length - 1
const texts = ['A square of paper, white side up.', ...crane.steps.map(step => step.text), FINISH.text]
const stops = [...texts.keys()].map(step => (step > crane.steps.length ? last : states.findLastIndex(state => state.step === step)))

const stage = document.querySelector('#scene')
const caption = document.querySelector('#caption')
const count = document.querySelector('#count')
const play = document.querySelector('#play')

const ease = t => t * t * (3 - 2 * t)
const clamp = (value, low, high) => Math.min(high, Math.max(low, value))

const show = { at: 0, goal: 0, step: 0, playing: true, wait: PAUSE, yaw: 0, pitch: 0, held: false, rest: 0 }
const lens = { target: [0, 0, 0], radius: 1.1 }

const label = () => {
  count.textContent = `${show.step} / ${stops.length - 1}`
  caption.textContent = texts[show.step]
  play.textContent = show.playing ? '❚❚' : '▶'
}

const go = step => {
  show.step = clamp(step, 0, stops.length - 1)
  show.goal = stops[show.step]
  if (show.goal < show.at) show.at = show.goal
  label()
}

const poseNow = () => {
  const index = Math.min(last - 1, Math.floor(show.at))
  return poseAt(index, ease(show.at - index))
}

const frame = (pose, now) => {
  const all = pose.faces.flatMap(face => face.points)
  const low = all.reduce((a, p) => a.map((v, i) => Math.min(v, p[i])), [Infinity, Infinity, Infinity])
  const high = all.reduce((a, p) => a.map((v, i) => Math.max(v, p[i])), [-Infinity, -Infinity, -Infinity])
  const centre = scale3(add3(low, high), 0.5)
  const radius = Math.max(0.45, ...all.map(p => Math.hypot(...sub3(p, centre))))
  lens.target = add3(lens.target, scale3(sub3(centre, lens.target), 0.08))
  lens.radius += (radius - lens.radius) * 0.08
  const standing = ease(clamp(show.at - (last - 1), 0, 1))
  const camera = cameraOf({
    yaw: YAW + show.yaw,
    pitch: clamp(DOWN + (LEVEL - DOWN) * standing + show.pitch, 0.06, 1.5),
    target: lens.target,
    radius: lens.radius,
  })
  stage.innerHTML = renderPose(pose, model.mesh, camera, Math.floor(now / BOIL) % 5)
}

let before = performance.now()
const tick = now => {
  const elapsed = Math.min(0.05, (now - before) / 1000)
  before = now
  if (show.at < show.goal) show.at = Math.min(show.goal, show.at + elapsed / SECONDS)
  else if (show.playing && show.step < stops.length - 1) {
    show.wait -= elapsed
    if (show.wait <= 0) {
      show.wait = PAUSE
      go(show.step + 1)
    }
  } else if (show.playing) {
    show.playing = false
    label()
  }
  show.rest = show.held ? 0 : show.rest + elapsed
  if (show.at === last && show.rest > 1.5) show.yaw += SPIN * elapsed
  frame(poseNow(), now)
  requestAnimationFrame(tick)
}

document.querySelector('#next').addEventListener('click', () => {
  show.playing = false
  show.at = Math.max(show.at, stops[show.step])
  go(show.step + 1)
})
document.querySelector('#previous').addEventListener('click', () => {
  show.playing = false
  go(show.step - 1)
})
play.addEventListener('click', () => {
  show.playing = !show.playing
  if (show.playing && show.step === stops.length - 1) {
    show.at = 0
    go(0)
  }
  show.wait = 0
  label()
})

stage.addEventListener('pointerdown', event => {
  show.held = true
  stage.setPointerCapture(event.pointerId)
})
stage.addEventListener('pointermove', event => {
  if (!show.held) return
  show.yaw -= event.movementX * 0.008
  show.pitch = clamp(show.pitch + event.movementY * 0.006, -1.2, 1.2)
})
for (const kind of ['pointerup', 'pointercancel']) stage.addEventListener(kind, () => (show.held = false))

go(0)
requestAnimationFrame(tick)
