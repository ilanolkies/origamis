import catalog from './models/catalog.json' with { type: 'json' }
import { models } from './models/index.js'
import { defs, renderFrame } from './sketch.js'
import { buildTimeline } from './timeline.js'

const BOIL_MS = 150
const LEVELS = 5
const gallery = document.querySelector('#gallery')
const calm = matchMedia('(prefers-reduced-motion: reduce)')

const pieces = models.map(model => {
  const timeline = buildTimeline(model)
  const items = timeline.steps.at(-1).after
  return {
    model,
    facts: catalog[model.id],
    steps: timeline.steps.length,
    frame: { view: timeline.fitView(items), items },
  }
})

document.body.insertAdjacentHTML('afterbegin', defs)
gallery.innerHTML = pieces
  .map(
    ({ model, facts, steps }) => `
      <a class="piece" href="fold.html?model=${model.id}">
        <svg viewBox="0 0 1 1" role="img" aria-label="${model.name}"></svg>
        <span class="label">
          <span class="kana" lang="ja">${model.kana}</span>
          <span class="name">${model.name}</span>
          <span class="tag">${facts.category}</span>
          <span class="facts">
            <span><b>${model.parts.length}</b> pieces</span>
            <span><b>${steps}</b> steps</span>
            <span><b>${facts.minutes}</b> min</span>
          </span>
          <span class="level" role="img" aria-label="Difficulty ${facts.difficulty} of ${LEVELS}">
            <span>Difficulty</span>
            <span class="bar"><span class="fill" style="width: ${(facts.difficulty / LEVELS) * 100}%"></span></span>
            <span>${facts.difficulty}/${LEVELS}</span>
          </span>
          <span class="needs">${model.sheetCm} cm paper · ${facts.tools.join(', ')}</span>
        </span>
      </a>`,
  )
  .join('')

const drawings = [...gallery.querySelectorAll('.piece svg')]

const paint = seed =>
  pieces.forEach((piece, index) => {
    const { viewBox, markup } = renderFrame(piece.frame, seed + index * 17)
    drawings[index].setAttribute('viewBox', viewBox)
    drawings[index].innerHTML = markup
  })

gallery.addEventListener('pointermove', event => {
  const label = event.target.closest('.piece')?.querySelector('.label')
  if (!label) return
  label.style.setProperty('--x', `${Math.min(event.clientX + 18, innerWidth - label.offsetWidth - 14)}px`)
  label.style.setProperty('--y', `${Math.min(event.clientY + 18, innerHeight - label.offsetHeight - 14)}px`)
})

let boil = 0
paint(boil)
setInterval(() => {
  if (!calm.matches) paint(++boil)
}, BOIL_MS)
