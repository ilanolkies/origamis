import { renderFrame, thumbnail } from './sketch.js'
import { buildTimeline } from './timeline.js'

const BOIL_MS = 150

const sections = timeline =>
  timeline.sections
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

export const createViewer = ({ stage, layer, shouts, panel, count, caption, previousButton, nextButton }) => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)')
  let model = null
  let timeline = null
  let total = 0
  let position = 0
  let landing = null
  let run = 0
  let boil = 0
  let sweeping = false
  let live = false

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
      if (stepNumber === current && !sweeping) button.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }

  const rest = () => {
    paint(timeline.idle(position))
    describe(position + 1)
  }

  const shout = words => {
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

  const animate = (index, backward, pace = 1, then = rest) => {
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
      const t = Math.min(1, (now - started) / (phase.duration * pace))
      if (!calm.matches) boil = Math.floor(now / BOIL_MS)
      paint(phase.frame(backward ? 1 - t : t))
      if (t < 1) return requestAnimationFrame(tick)
      if (!backward && !sweeping) shout(phase.sounds)
      active++
      started = null
      if (active < phases.length) return requestAnimationFrame(tick)
      finish()
      then()
    }
    requestAnimationFrame(tick)
  }

  const interrupt = () => {
    sweeping = false
    finish()
  }

  const next = () => {
    interrupt()
    if (position < total) animate(position, false)
    else rest()
  }

  const previous = () => {
    interrupt()
    if (position > 0) animate(position - 1, true)
    else rest()
  }

  const show = stepNumber => {
    interrupt()
    position = stepNumber - 1
    animate(position, false)
  }

  const length = () => timeline.steps.flatMap(step => step.phases).reduce((sum, phase) => sum + phase.duration, 0)

  const sweep = (target, ms, done = () => {}) => {
    interrupt()
    if (calm.matches || ms === 0) {
      position = target
      rest()
      return done()
    }
    sweeping = true
    const pace = ms / length()
    const step = () => {
      if (position === target) {
        sweeping = false
        rest()
        return done()
      }
      if (target < position) animate(position - 1, true, pace, step)
      else animate(position, false, pace, step)
    }
    step()
  }

  nextButton.addEventListener('click', () => live && next())
  previousButton.addEventListener('click', () => live && previous())
  panel.addEventListener('click', event => {
    const button = event.target.closest('.step')
    if (live && button) show(Number(button.dataset.step))
  })
  addEventListener('keydown', event => {
    if (!live) return
    if (event.key === 'ArrowRight') next()
    if (event.key === 'ArrowLeft') previous()
  })
  setInterval(() => {
    if (!timeline || landing !== null || calm.matches) return
    boil++
    paint(timeline.idle(position))
  }, BOIL_MS)

  return {
    load(chosen) {
      run++
      landing = null
      sweeping = false
      model = chosen
      timeline = buildTimeline(chosen)
      total = timeline.steps.length
      position = total
      stage.setAttribute('aria-label', `Animated folding of the ${chosen.name.toLowerCase()}`)
      panel.innerHTML = sections(timeline)
      panel.scrollTop = 0
      rest()
    },
    sweep,
    start() {
      live = true
    },
    stop() {
      live = false
    },
    get total() {
      return total
    },
  }
}
