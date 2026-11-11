import { add, length, lerp, scale, sub, unit } from './geometry.js'

const TONES = {
  petal: [240, 96, 141],
  leaf: [79, 174, 118],
  fur: [244, 164, 84],
  dog: [191, 132, 84],
  fox: [232, 106, 46],
  rabbit: [170, 166, 196],
  pig: [247, 158, 176],
  melon: [234, 84, 92],
  rind: [74, 150, 82],
  rice: [236, 230, 214],
  nori: [52, 74, 60],
  salmon: [246, 130, 92],
  carrot: [242, 134, 46],
  cream: [248, 180, 204],
  cone: [218, 162, 96],
  sail: [236, 92, 72],
  wood: [176, 118, 72],
  rocket: [226, 74, 74],
  fins: [86, 128, 196],
  fuji: [78, 110, 178],
  pine: [52, 136, 84],
  snow: [206, 222, 238],
  scarf: [214, 64, 72],
  whale: [70, 130, 180],
  sun: [250, 196, 40],
  cicada: [112, 150, 72],
  helmet: [104, 88, 164],
  heart: [226, 72, 100],
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
  const base = TONES[item.colorUp ? item.tone : (item.back ?? 'paper')]
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

const partial = (stroke, share) => {
  const spans = stroke.slice(1).map((p, i) => length(sub(p, stroke[i])))
  let left = spans.reduce((sum, span) => sum + span, 0) * share
  const out = [stroke[0]]
  for (let i = 0; i < spans.length && left > 0; i++) {
    out.push(lerp(stroke[i], stroke[i + 1], Math.min(1, left / spans[i])))
    left -= spans[i]
  }
  return out
}

const trace = (stroke, seed, wobble) =>
  stroke
    .map((p, i) => `${i ? 'L' : 'M'}${point(add(p, [wobble * noise(seed + i), wobble * noise(seed + i + 50)]))}`)
    .join('')

const draw = {
  doodle: (item, seed, wobble) => {
    const paths = item.strokes
      .map((stroke, i) => {
        const share = Math.max(0, Math.min(1, item.progress * item.strokes.length - i))
        return share ? trace(partial(stroke, share), seed + i * 3.1, wobble * 0.45) : ''
      })
      .join('')
    return `<path class="${item.guide ? 'guide pencil' : 'pen'}" opacity="${item.opacity ?? 1}" d="${paths}"/>`
  },
  face: (item, seed, wobble) =>
    `<g opacity="${item.opacity ?? 1}">` +
    `<polygon points="${points(item.poly)}" fill="${colour(item)}"/>` +
    (item.colorUp ? `<polygon points="${points(item.poly)}" fill="url(#hatch)"/>` : '') +
    (item.lines ?? [])
      .map((line, i) => `<path class="crease kept ${line.kind}" d="${stroke(line.from, line.to, seed + 200 + i, wobble * 0.3)}"/>`)
      .join('') +
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
  const { viewBox, markup } = renderFrame({ view, items })
  return `<svg class="thumb" viewBox="${viewBox}" aria-hidden="true">${markup}</svg>`
}

export const defs = `
  <svg class="defs" width="0" height="0" aria-hidden="true">
    <defs>
      <pattern id="hatch" patternUnits="userSpaceOnUse" width="0.05" height="0.05" patternTransform="rotate(38)">
        <line class="hatch" x1="0" y1="0.025" x2="0.05" y2="0.025" />
      </pattern>
      <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="0.022" />
      </filter>
    </defs>
  </svg>`
