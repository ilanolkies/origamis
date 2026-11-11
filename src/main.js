import { difficultyOf, LEVELS, piecesOf } from './actions/index.js'
import catalog from './models/catalog.json' with { type: 'json' }
import categories from './models/categories.json' with { type: 'json' }
import { categoryOf, models } from './models/index.js'
import { defs, renderFrame } from './sketch.js'
import { buildTimeline } from './timeline.js'
import { createViewer } from './viewer.js'
import { enableZoom } from './zoom.js'

const BOIL_MS = 150
const PIECE_SIZE = 440
const MARGIN = 400
const DRAG_THRESHOLD = 6
const PAN_MS = 700
const EDGE = 24
const FLIGHT_MS = 850
const UNFOLD_MS = 2200
const FOLD_UP_MS = 900
const RETURN_MS = 700
const SETTLE_MS = 400
const TITLE = document.title

const root = document.documentElement
const masthead = document.querySelector('.masthead')
const home = document.querySelector('#home')
const tag = document.querySelector('#model')
const sketchpad = document.querySelector('#gallery')
const stage = document.querySelector('#stage')
const calm = matchMedia('(prefers-reduced-motion: reduce)')

const viewer = createViewer({
  stage,
  layer: document.querySelector('#frame'),
  shouts: document.querySelector('#sfx'),
  panel: document.querySelector('#steps'),
  count: document.querySelector('#count'),
  caption: document.querySelector('#caption'),
  previousButton: document.querySelector('#previous'),
  nextButton: document.querySelector('#next'),
})

const pieces = models.map(model => {
  const timeline = buildTimeline(model)
  const items = timeline.steps.at(-1).after
  return {
    model,
    facts: catalog[model.id],
    difficulty: difficultyOf(model),
    steps: timeline.steps.length,
    frame: { view: timeline.fitView(items), items },
  }
})

const plural = (count, word) => `<b>${count}</b> ${word}${count === 1 ? '' : 's'}`
const at = ({ x, y }) => `left: ${x + MARGIN}px; top: ${y + MARGIN}px`

const card = ({ model, facts, difficulty, steps }) => `
      <a class="piece" href="?model=${model.id}" data-model="${model.id}" style="${at(facts.place)}; --tilt: ${facts.place.tilt}deg">
        <svg viewBox="0 0 1 1" role="img" aria-label="${model.name}"></svg>
        <span class="label">
          <span class="kana" lang="ja">${model.kana}</span>
          <span class="name">${model.name}</span>
          <span class="tag">${categoryOf(model)}</span>
          <span class="facts">
            <span>${plural(piecesOf(model), 'piece')}</span>
            <span>${plural(steps, 'step')}</span>
            <span><b>${facts.minutes}</b> min</span>
          </span>
          <span class="level" role="img" aria-label="Difficulty ${difficulty} of ${LEVELS}">
            <span>Difficulty</span>
            <span class="bar"><span class="fill" style="width: ${(difficulty / LEVELS) * 100}%"></span></span>
            <span>${difficulty}/${LEVELS}</span>
          </span>
          <span class="needs">${model.paper ?? `${model.sheetCm} cm paper`} · ${facts.tools.join(', ')}</span>
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
enableZoom(sketchpad, sketchpad.querySelector('.world'))

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

const paintGallery = seed =>
  pieces.forEach((piece, index) => {
    const { viewBox, markup } = renderFrame(piece.frame, seed + index * 17)
    drawings[index].setAttribute('viewBox', viewBox)
    arts[index].innerHTML = markup
  })

let boil = 0
paintGallery(boil)
setInterval(() => {
  if (!calm.matches && !root.classList.contains('viewing')) paintGallery(++boil)
}, BOIL_MS)

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

const measure = () => root.style.setProperty('--mast', `${masthead.offsetHeight}px`)
measure()
addEventListener('resize', measure)

const spotOf = piece => {
  const box = piece.getBoundingClientRect()
  return {
    x: box.left + box.width / 2,
    y: box.top + box.height / 2,
    size: box.width,
    turn: getComputedStyle(piece.querySelector('svg')).transform,
  }
}

const placed = ({ x, y, size, turn = 'none' }) => {
  const box = stage.getBoundingClientRect()
  const dx = x - (box.left + box.width / 2)
  const dy = y - (box.top + box.height / 2)
  const grow = size / Math.min(box.width, box.height)
  return `translate(${dx}px, ${dy}px) ${turn === 'none' ? '' : turn} scale(${grow})`
}

const duration = ms => (calm.matches ? 0 : ms)

const ease = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

const reveal = (piece, done) => {
  const box = piece.getBoundingClientRect()
  const top = masthead.offsetHeight
  const fits =
    box.left >= EDGE && box.right <= innerWidth - EDGE && box.top >= top && box.bottom <= innerHeight - EDGE
  if (fits) return done()
  const from = [sketchpad.scrollLeft, sketchpad.scrollTop]
  const to = [
    from[0] + box.left + box.width / 2 - innerWidth / 2,
    from[1] + box.top + box.height / 2 - (top + innerHeight) / 2,
  ]
  const ms = duration(PAN_MS)
  let start = null
  const glide = now => {
    start ??= now
    const k = ms ? ease(Math.min(1, (now - start) / ms)) : 1
    sketchpad.scrollTo(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k)
    if (k < 1) return requestAnimationFrame(glide)
    done()
  }
  requestAnimationFrame(glide)
}

let shown = null
let busy = false

const open = (model, done) => {
  busy = true
  shown = model
  const piece = sketchpad.querySelector(`[data-model="${model.id}"]`)
  reveal(piece, () => fly(model, piece, done))
}

const fly = (model, piece, done) => {
  const from = spotOf(piece)
  viewer.load(model)
  tag.innerHTML = `<span lang="ja">${model.kana}</span> ${model.name}`
  document.title = `${model.name} ${model.kana}`
  piece.classList.add('chosen')
  root.classList.add('viewing')
  const flight = stage.animate([{ transform: placed(from) }, { transform: 'none' }], {
    duration: duration(FLIGHT_MS),
    easing: 'cubic-bezier(0.5, 0, 0.2, 1)',
  })
  flight.finished.then(() => {
    busy = false
    root.classList.add('docked')
    viewer.start()
    viewer.sweep(0, UNFOLD_MS)
    done()
  })
}

const close = done => {
  busy = true
  const piece = sketchpad.querySelector('.chosen')
  viewer.stop()
  root.classList.remove('docked')
  document.title = TITLE
  viewer.sweep(viewer.total, duration(FOLD_UP_MS), () => {
    const flight = stage.animate([{ transform: 'none' }, { transform: placed(spotOf(piece)) }], {
      duration: duration(RETURN_MS),
      easing: 'cubic-bezier(0.5, 0, 0.25, 1)',
      fill: 'forwards',
    })
    flight.finished.then(() => {
      root.classList.remove('viewing')
      piece.classList.remove('chosen')
      flight.cancel()
      shown = null
      busy = false
      done()
    })
  })
}

const wanted = () => models.find(model => model.id === new URLSearchParams(location.search).get('model')) ?? null

const sync = () => {
  if (busy) return
  const model = wanted()
  if (model === shown) return
  if (shown) return close(sync)
  if (model) open(model, sync)
}

const go = id => {
  history.pushState(null, '', id ? `?model=${id}` : location.pathname)
  sync()
}

sketchpad.addEventListener('click', event => {
  const piece = event.target.closest('.piece')
  if (!piece || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  go(piece.dataset.model)
})

home.addEventListener('click', event => {
  event.preventDefault()
  if (shown) go(null)
})

addEventListener('keydown', event => {
  if (event.key === 'Escape' && shown) go(null)
})

addEventListener('popstate', sync)

if (location.search && !wanted()) history.replaceState(null, '', location.pathname)
if (wanted()) document.fonts.ready.then(() => setTimeout(sync, duration(SETTLE_MS)))
