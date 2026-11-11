import { add, polar } from '../geometry.js'

export const SIDE_CM = 15
export const CM = SIDE_CM / Math.SQRT2
export const cm = units => (units * CM).toFixed(1)

export const DIAMOND = [[0, 1], [-1, 0], [0, -1], [1, 0]]
export const CENTRE = [0, 0]
export const mirror = p => [-p[0], p[1]]
export const flip = p => [p[0], -p[1]]

export const arc = (centre, radius, from, to, count = 8) =>
  Array.from({ length: count + 1 }, (_, i) => add(centre, polar(from + ((to - from) * i) / count, radius)))

export const edgeReach = angle => 1 / (Math.cos((angle * Math.PI) / 180) + Math.sin((angle * Math.PI) / 180))

export const HALVE_UP = { from: [-1, 0], to: [1, 0], mover: [0, -1], kind: 'valley', bend: 1 }
export const HALVE_DOWN = { from: [-1, 0], to: [1, 0], mover: [0, 1], kind: 'valley', bend: -1 }

export const LONG = Math.SQRT2 / 2
export const SHORT = LONG / 2
export const HALF_SHEET = [[-LONG, -SHORT], [LONG, -SHORT], [LONG, SHORT], [-LONG, SHORT]]
export const HALF_SHEET_CM = `${SIDE_CM} × ${SIDE_CM / 2} cm`
