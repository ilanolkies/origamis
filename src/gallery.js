import { models } from './models/index.js'
import { defs, renderFrame } from './sketch.js'
import { buildTimeline } from './timeline.js'

const BOIL_MS = 150
const gallery = document.querySelector('#gallery')
const calm = matchMedia('(prefers-reduced-motion: reduce)')

const pieces = models.map(model => {
  const timeline = buildTimeline(model)
  const items = timeline.steps.at(-1).after
  return { model, steps: timeline.steps.length, frame: { view: timeline.fitView(items), items } }
})

document.body.insertAdjacentHTML('afterbegin', defs)
gallery.innerHTML = pieces
  .map(
    ({ model, steps }) => `
      <a class="piece" href="fold.html?model=${model.id}">
        <svg viewBox="0 0 1 1" role="img" aria-label="${model.name}"></svg>
        <span class="label">
          <span class="kana" lang="ja">${model.kana}</span>
          <span class="name">${model.name}</span>
          <span class="note">${model.parts.length} sheets · ${steps} steps</span>
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

let boil = 0
paint(boil)
setInterval(() => {
  if (!calm.matches) paint(++boil)
}, BOIL_MS)
