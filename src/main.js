import { models } from './models/index.js'
import { defs, renderFrame, thumbnail } from './sketch.js'
import { buildTimeline } from './timeline.js'

const SOUNDS = {
  fold: ['パタッ', 'ペタッ', 'スッ', 'キュッ'],
  swap: ['シュッ'],
  join: ['ポンッ'],
  draw: ['カキカキ'],
}
const BOIL_MS = 150

const chosen = new URLSearchParams(location.search).get('model')
const model = models.find(candidate => candidate.id === chosen) ?? models[0]
const timeline = buildTimeline(model)
const total = timeline.steps.length
const stage = document.querySelector('#stage')
const layer = document.querySelector('#frame')
const shouts = document.querySelector('#sfx')
const panel = document.querySelector('#steps')
const count = document.querySelector('#count')
const caption = document.querySelector('#caption')
const previousButton = document.querySelector('#previous')
const nextButton = document.querySelector('#next')
const calm = matchMedia('(prefers-reduced-motion: reduce)')

document.body.insertAdjacentHTML('afterbegin', defs)
document.title = `${model.name} ${model.kana}`
document.querySelector('#model').innerHTML = `<span lang="ja">${model.kana}</span> ${model.name}`
stage.setAttribute('aria-label', `Animated folding of the ${model.name.toLowerCase()}`)

let position = 0
let landing = null
let run = 0
let boil = 0

panel.innerHTML = timeline.sections
  .map(
    section => `
      <section class="part">
        <header>
          <span class="kanji">${section.kanji}</span>
          <div><h2>${section.name}</h2><p>${section.paper}</p></div>
          ${thumbnail(section.preview, timeline.fitView(section.preview))}
        </header>
        <ol>
          ${section.steps
            .map(
              step => `
                <li>
                  <button type="button" class="step" data-step="${step.number}">
                    <span class="number">${step.number}</span>
                    <span class="text">${step.text}</span>
                    <span class="stamp" aria-hidden="true">済</span>
                  </button>
                </li>`,
            )
            .join('')}
        </ol>
      </section>`,
  )
  .join('')

const paint = frame => {
  const { viewBox, markup } = renderFrame(frame, boil)
  stage.setAttribute('viewBox', viewBox)
  layer.innerHTML = markup
}

const describe = current => {
  const done = current > total
  count.textContent = done ? 'できた！' : `Step ${current} / ${total}`
  caption.textContent = done ? `Your ${model.name.toLowerCase()} is done.` : timeline.steps[current - 1].text
  previousButton.disabled = position === 0 && landing === null
  nextButton.disabled = position === total && landing === null
  for (const button of panel.querySelectorAll('.step')) {
    const stepNumber = Number(button.dataset.step)
    button.classList.toggle('done', stepNumber < current)
    button.classList.toggle('current', stepNumber === current)
    if (stepNumber === current) button.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

const rest = () => {
  paint(timeline.idle(position))
  describe(position + 1)
}

const shout = kind => {
  const words = SOUNDS[kind]
  const word = document.createElement('span')
  word.className = 'shout'
  word.textContent = words[Math.floor(Math.random() * words.length)]
  word.style.left = `${8 + Math.random() * 60}%`
  word.style.top = `${6 + Math.random() * 22}%`
  word.style.setProperty('--turn', `${-14 + Math.random() * 28}deg`)
  word.addEventListener('animationend', () => word.remove())
  shouts.append(word)
}

const finish = () => {
  if (landing === null) return
  position = landing
  landing = null
  run++
}

const animate = (index, backward) => {
  const phases = backward ? [...timeline.steps[index].phases].reverse() : timeline.steps[index].phases
  const mine = ++run
  let active = 0
  let started = null
  landing = backward ? index : index + 1
  describe(index + 1)
  const tick = now => {
    if (mine !== run) return
    started ??= now
    const phase = phases[active]
    const t = Math.min(1, (now - started) / phase.duration)
    if (!calm.matches) boil = Math.floor(now / BOIL_MS)
    paint(phase.frame(backward ? 1 - t : t))
    if (t < 1) return requestAnimationFrame(tick)
    if (!backward) shout(phase.kind)
    active++
    started = null
    if (active < phases.length) return requestAnimationFrame(tick)
    finish()
    rest()
  }
  requestAnimationFrame(tick)
}

const next = () => {
  finish()
  if (position < total) animate(position, false)
  else rest()
}

const previous = () => {
  finish()
  if (position > 0) animate(position - 1, true)
  else rest()
}

const show = stepNumber => {
  finish()
  position = stepNumber - 1
  animate(position, false)
}

nextButton.addEventListener('click', next)
previousButton.addEventListener('click', previous)
panel.addEventListener('click', event => {
  const button = event.target.closest('.step')
  if (button) show(Number(button.dataset.step))
})
addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') next()
  if (event.key === 'ArrowLeft') previous()
})
setInterval(() => {
  if (landing !== null || calm.matches) return
  boil++
  paint(timeline.idle(position))
}, BOIL_MS)

rest()
