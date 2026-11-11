import { actions, piecesOf } from './actions/index.js'
import { sheet } from './geometry.js'
import { ease, fitView, look, mixView, placed, shifted } from './scene.js'

const SLIDE = 2.6

const swapPhase = (leaving, arriving) => {
  const viewFrom = fitView(leaving)
  const viewTo = fitView(arriving)
  return {
    kind: 'swap',
    sounds: ['シュッ'],
    duration: 800,
    frame: t => {
      const k = ease(t)
      return {
        view: mixView(viewFrom, viewTo, k),
        items: [...shifted(leaving, [-SLIDE * k, 0], 1 - k), ...shifted(arriving, [SLIDE * (1 - k), 0], k)],
      }
    },
  }
}

export const buildTimeline = model => {
  const steps = []
  const sections = []
  const finals = {}
  let shown = null

  for (const part of model.parts) {
    const section = { name: part.name, kanji: part.kanji, paper: part.paper, steps: [] }
    let paper = { faces: sheet(model.sheet), doodles: [], folds: [], creases: [], tone: part.tone, back: part.back }
    part.steps.forEach((step, index) => {
      const start = look(paper)
      const swap = index === 0 && shown
      const phases = swap ? [swapPhase(shown, start)] : []
      const marks = step.actions.flatMap(action => actions[action.kind].marks(paper, action))
      for (const action of step.actions) {
        const done = actions[action.kind].perform(paper, action)
        phases.push(...[done.phase].flat())
        paper = done.paper
      }
      const entry = {
        number: steps.length + 1,
        text: step.text,
        phases,
        start: swap ? shown : start,
        marks: swap ? [] : marks,
        after: look(paper),
      }
      steps.push(entry)
      section.steps.push(entry)
    })
    finals[part.id] = look(paper)
    shown = finals[part.id]
    section.preview = shown
    sections.push(section)
  }

  const { assembly } = model
  if (assembly) {
    const pieces = piecesOf(model)
    const section = {
      name: assembly.name,
      kanji: assembly.kanji,
      paper: pieces === 2 ? 'Both pieces' : `All ${pieces} pieces`,
      steps: [],
    }
    let items = placed(finals[assembly.base.part], assembly.base)
    for (const step of assembly.steps) {
      const start = items
      const marks = step.actions.flatMap(action => actions[action.kind].marks(start, action))
      const phases = []
      for (const action of step.actions) {
        const done = actions[action.kind].assemble(items, action, finals)
        phases.push(done.phase)
        items = done.items
      }
      const entry = { number: steps.length + 1, text: step.text, phases, start, marks, after: items }
      steps.push(entry)
      section.steps.push(entry)
    }
    section.preview = items
    sections.push(section)
  }

  const idle = position => {
    const items = position === 0 ? steps[0].start : steps[position - 1].after
    const marks = position < steps.length ? steps[position].marks : []
    return { view: fitView(items), items: [...items, ...marks] }
  }

  return { steps, sections, idle, fitView }
}
