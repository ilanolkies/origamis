import {
  add,
  apply,
  bounds,
  creaseSegment,
  dot,
  fold,
  length,
  lerp,
  reflection,
  scale,
  sheet,
  sub,
  unit,
} from './fold.js'

const CAMERA_HEIGHT = 5
const LIGHT = [0.22, -0.28]
const DROP_HEIGHT = 1.4
const SLIDE = 2.6

const ease = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const settle = t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2

const scene = (faces, tone) =>
  faces.map(face => ({ type: 'face', poly: face.poly, colorUp: face.colorUp, tone, shade: 1 }))

const shifted = (items, offset, opacity = 1) =>
  items.map(item =>
    item.type === 'doodle'
      ? { ...item, strokes: item.strokes.map(stroke => stroke.map(p => add(p, offset))), opacity }
      : { ...item, poly: item.poly.map(p => add(p, offset)), opacity },
  )

const fitView = items => {
  const box = bounds(items.filter(item => item.poly))
  return {
    center: [(box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2],
    size: Math.max(1.5, Math.max(box.maxX - box.minX, box.maxY - box.minY) * 1.45),
  }
}

const mixView = (a, b, t) => ({ center: lerp(a.center, b.center, t), size: a.size + (b.size - a.size) * t })

const marksFor = (faces, creases) =>
  creases.flatMap(crease => {
    const [from, to] = creaseSegment(faces, crease.from, crease.to)
    const target = apply(reflection(crease.from, crease.to), crease.mover)
    const reach = length(sub(target, crease.mover))
    const control = add(
      lerp(crease.mover, target, 0.5),
      scale(unit(sub(crease.to, crease.from)), crease.bend * 0.45 * reach),
    )
    return [
      { type: 'crease', from, to, kind: crease.kind },
      { type: 'arrow', from: crease.mover, control, to: target },
    ]
  })

const foldPhase = (before, crease, tone) => {
  const result = fold(before, crease)
  const axis = unit(sub(crease.to, crease.from))
  const viewFrom = fitView(before)
  const viewTo = fitView(result.faces)
  const eye = lerp(viewFrom.center, viewTo.center, 0.5)
  const lift = crease.kind === 'valley' ? 1 : -1
  const [lineFrom, lineTo] = creaseSegment(before, crease.from, crease.to)
  const stays = scene(result.stays, tone)

  const swing = (p, angle) => {
    const foot = add(crease.from, scale(axis, dot(sub(p, crease.from), axis)))
    const arm = sub(p, foot)
    return { flat: add(foot, scale(arm, Math.cos(angle))), height: length(arm) * Math.sin(angle) * lift }
  }
  const project = ({ flat, height }) =>
    add(eye, scale(sub(flat, eye), CAMERA_HEIGHT / (CAMERA_HEIGHT - height)))

  return {
    kind: 'fold',
    duration: 1150,
    after: result.faces,
    frame: t => {
      const angle = Math.PI * ease(t)
      const flipped = angle > Math.PI / 2
      const tilt = Math.sin(angle)
      const swung = result.moving.map(face => ({ face, points: face.poly.map(p => swing(p, angle)) }))
      const movers = swung.map(({ face, points }) => ({
        type: 'face',
        poly: points.map(project),
        colorUp: flipped ? !face.colorUp : face.colorUp,
        tone,
        shade: 1 - tilt * (flipped ? 0.3 : 0.12),
      }))
      if (flipped) movers.reverse()
      const line = { type: 'crease', from: lineFrom, to: lineTo, kind: crease.kind }
      const cast = {
        type: 'shadow',
        polys: swung.map(({ points }) => points.map(({ flat, height }) => add(flat, scale(LIGHT, height)))),
        opacity: 0.3 * tilt,
      }
      return {
        view: mixView(viewFrom, viewTo, ease(t)),
        items: lift > 0 ? [...stays, line, cast, ...movers] : [...movers, ...stays, line],
      }
    },
  }
}

const swapPhase = (leaving, arriving) => {
  const viewFrom = fitView(leaving)
  const viewTo = fitView(arriving)
  return {
    kind: 'swap',
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

const drawPhase = (items, strokes) => {
  const view = fitView(items)
  return {
    kind: 'draw',
    duration: 2000,
    frame: t => ({ view, items: [...items, { type: 'doodle', strokes, progress: t }] }),
  }
}

const joinPhase = (base, top, seat) => {
  const viewFrom = fitView(base)
  const viewTo = fitView([...base, ...shifted(top, seat)])
  return {
    kind: 'join',
    duration: 1200,
    frame: t => ({
      view: mixView(viewFrom, viewTo, ease(t)),
      items: [...base, ...shifted(top, add(seat, [0, (1 - settle(t)) * DROP_HEIGHT]), Math.min(1, t * 3))],
    }),
  }
}

export const buildTimeline = model => {
  const steps = []
  const sections = []
  const finals = {}
  let shown = null

  for (const part of model.parts) {
    const section = { name: part.name, kanji: part.kanji, paper: part.paper, steps: [] }
    let faces = sheet(model.sheet)
    let doodles = []
    part.steps.forEach((step, index) => {
      const start = [...scene(faces, part.tone), ...doodles]
      const swap = index === 0 && shown
      const phases = swap ? [swapPhase(shown, start)] : []
      let marks = []
      if (step.draw) {
        const doodle = { type: 'doodle', strokes: step.draw, progress: 1 }
        phases.push(drawPhase(start, step.draw))
        marks = [{ ...doodle, guide: true }]
        doodles = [...doodles, doodle]
      } else {
        marks = marksFor(faces, step.folds)
        for (const crease of step.folds) {
          const phase = foldPhase(faces, crease, part.tone)
          phases.push(phase)
          faces = phase.after
        }
      }
      const entry = {
        number: steps.length + 1,
        text: step.text,
        phases,
        start: swap ? shown : start,
        marks: swap ? [] : marks,
        after: [...scene(faces, part.tone), ...doodles],
      }
      steps.push(entry)
      section.steps.push(entry)
    })
    finals[part.id] = [...scene(faces, part.tone), ...doodles]
    shown = finals[part.id]
    section.preview = shown
    sections.push(section)
  }

  const { finish } = model
  const base = finals[finish.base]
  const top = finals[finish.top]
  const joined = [...base, ...shifted(top, finish.seat)]
  const last = {
    number: steps.length + 1,
    text: finish.text,
    phases: [joinPhase(base, top, finish.seat)],
    start: base,
    marks: [],
    after: joined,
  }
  steps.push(last)
  sections.push({ name: finish.name, kanji: finish.kanji, paper: 'Both pieces', steps: [last], preview: joined })

  const idle = position => {
    const items = position === 0 ? steps[0].start : steps[position - 1].after
    const marks = position < steps.length ? steps[position].marks : []
    return { view: fitView(items), items: [...items, ...marks] }
  }

  return { steps, sections, idle, fitView }
}
