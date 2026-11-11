import { add, length, lerp, scale, sub, unit } from './fold.js'

const TONES = {
  petal: [240, 96, 141],
  leaf: [79, 174, 118],
  paper: [255, 253, 246],
}
const GROUND = [0.03, -0.04]

const number = v => v.toFixed(4)
const point = p => `${number(p[0])} ${number(-p[1])}`
const points = poly => poly.map(p => `${number(p[0])},${number(-p[1])}`).join(' ')

const noise = n => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

const colour = item => {
  const base = item.colorUp ? TONES[item.tone] : TONES.paper
  return `rgb(${base.map(v => Math.round(v * (item.shade ?? 1))).join(' ')})`
}

const stroke = (a, b, seed, wobble) => {
  const span = length(sub(b, a))
  if (span < 1e-6) return ''
  const along = unit(sub(b, a))
  const across = [-along[1], along[0]]
  const over = Math.min(wobble * 2, span * 0.08)
  const start = add(add(a, scale(along, -over * (0.5 + 0.5 * noise(seed)))), scale(across, wobble * noise(seed + 1)))
  const end = add(add(b, scale(along, over * (0.5 + 0.5 * noise(seed + 2)))), scale(across, wobble * noise(seed + 3)))
  const control = add(lerp(a, b, 0.5 + 0.2 * noise(seed + 4)), scale(across, wobble * 1.6 * noise(seed + 5)))
  return `M${point(start)}Q${point(control)} ${point(end)}`
}

const outline = (poly, seed, wobble) =>
  poly.map((a, i) => stroke(a, poly[(i + 1) % poly.length], seed + i * 7.3, wobble)).join('')

const draw = {
  face: (item, seed, wobble) =>
    `<g opacity="${item.opacity ?? 1}">` +
    `<polygon points="${points(item.poly)}" fill="${colour(item)}"/>` +
    (item.colorUp ? `<polygon points="${points(item.poly)}" fill="url(#hatch)"/>` : '') +
    `<path class="ink" d="${outline(item.poly, seed, wobble)}${outline(item.poly, seed + 100, wobble)}"/>` +
    '</g>',
  shadow: item =>
    `<g class="cast" opacity="${number(item.opacity)}">${item.polys
      .map(poly => `<polygon points="${points(poly)}"/>`)
      .join('')}</g>`,
  crease: (item, seed, wobble) =>
    `<path class="crease ${item.kind}" d="${stroke(item.from, item.to, seed, wobble * 0.5)}"/>`,
  arrow: (item, seed, wobble) => {
    const heading = unit(sub(item.to, item.control))
    const across = [-heading[1], heading[0]]
    const barb = Math.min(wobble * 9, length(sub(item.to, item.from)) * 0.4)
    const back = sub(item.to, scale(heading, barb))
    const jitter = scale(across, wobble * noise(seed))
    return (
      `<path class="guide" d="M${point(item.from)}Q${point(add(item.control, jitter))} ${point(item.to)}` +
      `M${point(add(back, scale(across, barb * 0.55)))}L${point(item.to)}L${point(sub(back, scale(across, barb * 0.55)))}"/>`
    )
  },
}

export const renderFrame = (frame, seed = 0) => {
  const { center, size } = frame.view
  const wobble = size * 0.0035
  const viewBox = [center[0] - size / 2, -center[1] - size / 2, size, size].map(number).join(' ')
  const ground = frame.items
    .filter(item => item.type === 'face')
    .map(item => `<polygon points="${points(item.poly.map(p => add(p, GROUND)))}" opacity="${item.opacity ?? 1}"/>`)
    .join('')
  const body = frame.items.map((item, index) => draw[item.type](item, seed * 13.7 + index * 31.1, wobble)).join('')
  return { viewBox, markup: `<g class="ground">${ground}</g>${body}` }
}

export const thumbnail = (items, view) => {
  const { viewBox } = renderFrame({ view, items: [] })
  const shapes = items
    .map(item => `<polygon points="${points(item.poly)}" fill="${colour(item)}"/>`)
    .join('')
  return `<svg class="thumb" viewBox="${viewBox}" aria-hidden="true">${shapes}</svg>`
}
