import catalog from './models/catalog.json' with { type: 'json' }
import categories from './models/categories.json' with { type: 'json' }
import { models } from './models/index.js'
import { defs, renderFrame } from './sketch.js'
import { buildTimeline } from './timeline.js'

const BOIL_MS = 150
const LEVELS = 5
const PIECE_SIZE = 440
const MARGIN = 400
const DRAG_THRESHOLD = 6
const sketchpad = document.querySelector('#gallery')
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

const plural = (count, word) => `<b>${count}</b> ${word}${count === 1 ? '' : 's'}`
const at = ({ x, y }) => `left: ${x + MARGIN}px; top: ${y + MARGIN}px`

const card = ({ model, facts, steps }) => `
      <a class="piece" href="fold.html?model=${model.id}" style="${at(facts.place)}; --tilt: ${facts.place.tilt}deg">
        <svg viewBox="0 0 1 1" role="img" aria-label="${model.name}"></svg>
        <span class="label">
          <span class="kana" lang="ja">${model.kana}</span>
          <span class="name">${model.name}</span>
          <span class="tag">${facts.category}</span>
          <span class="facts">
            <span>${plural(model.parts.length, 'piece')}</span>
            <span>${plural(steps, 'step')}</span>
            <span><b>${facts.minutes}</b> min</span>
          </span>
          <span class="level" role="img" aria-label="Difficulty ${facts.difficulty} of ${LEVELS}">
            <span>Difficulty</span>
            <span class="bar"><span class="fill" style="width: ${(facts.difficulty / LEVELS) * 100}%"></span></span>
            <span>${facts.difficulty}/${LEVELS}</span>
          </span>
          <span class="needs">${model.sheetCm} cm paper · ${facts.tools.join(', ')}</span>
        </span>
      </a>`

const reach = (axis, size) =>
  Math.max(
    ...pieces.map(({ facts }) => facts.place[axis] + size),
    ...Object.values(categories).map(place => place[axis] + size),
  )

document.body.insertAdjacentHTML('afterbegin', defs)
sketchpad.innerHTML = `
  <div class="world" style="width: ${reach('x', PIECE_SIZE) + 2 * MARGIN}px; height: ${reach('y', PIECE_SIZE) + 2 * MARGIN}px">
    ${Object.entries(categories)
      .map(([name, place]) => `<h2 class="chip" style="${at(place)}">${name}</h2>`)
      .join('')}
    ${pieces.map(card).join('')}
  </div>`

sketchpad.scrollLeft = MARGIN - 20
sketchpad.scrollTop = MARGIN - 20

const outline = items => {
  const points = items
    .filter(item => item.poly)
    .flatMap(item => item.poly)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const chain = list => {
    const half = []
    for (const point of list) {
      while (half.length > 1 && turn(half.at(-2), half.at(-1), point) <= 0) half.pop()
      half.push(point)
    }
    return half.slice(0, -1)
  }
  return [...chain(points), ...chain([...points].reverse())]
}

const drawings = [...sketchpad.querySelectorAll('.piece svg')]

pieces.forEach((piece, index) => {
  const hull = outline(piece.frame.items).map(([x, y]) => `${x.toFixed(4)},${(-y).toFixed(4)}`)
  drawings[index].innerHTML = `<polygon class="hit" points="${hull.join(' ')}"/><g class="art"></g>`
})

const arts = drawings.map(drawing => drawing.querySelector('.art'))

const paint = seed =>
  pieces.forEach((piece, index) => {
    const { viewBox, markup } = renderFrame(piece.frame, seed + index * 17)
    drawings[index].setAttribute('viewBox', viewBox)
    arts[index].innerHTML = markup
  })

sketchpad.addEventListener('pointermove', event => {
  const label = event.target.closest('.piece')?.querySelector('.label')
  if (!label) return
  label.style.setProperty('--x', `${Math.min(event.clientX + 18, innerWidth - label.offsetWidth - 14)}px`)
  label.style.setProperty('--y', `${Math.min(event.clientY + 18, innerHeight - label.offsetHeight - 14)}px`)
})

let drag = null
let dragged = false

sketchpad.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return
  drag = { x: event.clientX, y: event.clientY, left: sketchpad.scrollLeft, top: sketchpad.scrollTop }
  dragged = false
})

sketchpad.addEventListener('pointermove', event => {
  if (!drag) return
  const dx = event.clientX - drag.x
  const dy = event.clientY - drag.y
  if (!dragged && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
  if (!dragged) {
    dragged = true
    sketchpad.setPointerCapture(event.pointerId)
    sketchpad.classList.add('panning')
  }
  sketchpad.scrollLeft = drag.left - dx
  sketchpad.scrollTop = drag.top - dy
})

const release = () => {
  drag = null
  sketchpad.classList.remove('panning')
}

sketchpad.addEventListener('pointerup', release)
sketchpad.addEventListener('pointercancel', release)
sketchpad.addEventListener(
  'click',
  event => {
    if (!dragged) return
    event.preventDefault()
    dragged = false
  },
  true,
)

let boil = 0
paint(boil)
setInterval(() => {
  if (!calm.matches) paint(++boil)
}, BOIL_MS)
