import { add, length, polar, sub } from '../../geometry.js'
import { cm, DIAMOND, edgeReach, SIDE_CM } from '../shapes.js'

const TOP = [0, 1]
const SLANT = 60
const [SHOULDER_X, SHOULDER] = add(TOP, polar(-SLANT, 2 * edgeReach(SLANT)))
const TIP = 0.8
const CORNER = 0.6
const BAND = 0.35
const WIDTH = 0.5
const WRAP = 0.05

export const onigiri = {
  id: 'onigiri',
  name: 'Onigiri',
  kana: 'おにぎり',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'rice',
      name: 'Rice',
      kanji: 'ご飯',
      tone: 'rice',
      paper: `${SIDE_CM} cm square, white on one side`,
      steps: [
        {
          text: `White side up, a corner toward you. Fold the two side corners behind along creases from the top corner to spots ${cm(length(sub([1, 0], [SHOULDER_X, SHOULDER])))} cm down the lower edges.`,
          actions: [
            { from: TOP, to: add(TOP, polar(-SLANT)), mover: [1, 0], kind: 'mountain', bend: -1 },
            { from: TOP, to: add(TOP, polar(SLANT + 180)), mover: [-1, 0], kind: 'mountain', bend: 1 },
          ],
        },
        {
          text: 'Fold the bottom corner up behind, along the line between the side corners.',
          actions: [{ from: [-1, SHOULDER], to: [1, SHOULDER], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: `Round the rice ball: fold the top tip behind ${cm(1 - TIP)} cm down, and both bottom tips behind along upright creases ${cm(SHOULDER_X - CORNER)} cm in.`,
          actions: [
            { from: [-1, TIP], to: [1, TIP], mover: [0, 1], kind: 'mountain', bend: 1 },
            { from: [-CORNER, 0], to: [-CORNER, 1], mover: [-1, -1], kind: 'mountain', bend: 1 },
            { from: [CORNER, 0], to: [CORNER, 1], mover: [1, -1], kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
    {
      id: 'nori',
      name: 'Nori',
      kanji: '海苔',
      tone: 'nori',
      paper: `${SIDE_CM} cm square, dark green on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the left corner over to the right corner.',
          actions: [{ from: [0, -1], to: [0, 1], mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: 'Fold the right corner back to the fold, along an upright crease halfway across.',
          actions: [{ from: [WIDTH, -1], to: [WIDTH, 1], mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: `Fold the top and bottom points behind, ${cm(1 - BAND)} cm from each tip, to make a strip.`,
          actions: [
            { from: [-1, BAND], to: [1, BAND], mover: [0, 1], kind: 'mountain', bend: 1 },
            { from: [-1, -BAND], to: [1, -BAND], mover: [0, -1], kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
  ],
  finish: {
    name: 'Finish',
    kanji: '完成',
    base: 'rice',
    top: 'nori',
    seat: [-WIDTH / 2, BAND - WRAP + SHOULDER],
    text: 'Wrap the strip over the bottom middle of the rice ball, so it pokes out a little below. A dab of glue keeps it in place.',
  },
}
