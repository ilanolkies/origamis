import { add, polar } from '../../geometry.js'
import { arc, DIAMOND, HALVE_DOWN, SIDE_CM } from '../shapes.js'

const CUT = 1 - Math.SQRT1_2
const HALF = Math.SQRT1_2
const HEAD = 0.65
const BAND = 0.12
const SCARF = 0.55
const NECK = 0.7
const BODY_SEAT = [0, 0]
const HEAD_SEAT = [0, HALF + HEAD * HALF - 0.12]
const SCARF_SEAT = [0, NECK + SCARF * BAND]
const size = scale => Math.round(scale * SIDE_CM)

const dot = (centre, radius = 0.035) => arc(centre, radius, 0, 360)
const [headX, headY] = HEAD_SEAT
const face = [
  dot([headX - 0.13, headY + 0.13]),
  dot([headX + 0.13, headY + 0.13]),
  [[headX, headY + 0.03], [headX + 0.24, headY - 0.01], [headX, headY - 0.04]],
  ...[240, 255, 270, 285, 300].map(angle => dot(add(HEAD_SEAT, polar(angle, 0.2)), 0.02)),
]
const buttons = [0.1, -0.2, -0.5].map(y => dot([0, y], 0.045))

export const snowman = {
  id: 'snowman',
  name: 'Snowman',
  kana: 'ゆきだるま',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  paper: `${size(1)}, ${size(HEAD)} and ${size(SCARF)} cm paper`,
  parts: [
    {
      id: 'ball',
      name: 'Snowball',
      kanji: '雪玉',
      tone: 'snow',
      copies: 2,
      paper: `${size(1)} and ${size(HEAD)} cm white squares`,
      steps: [
        {
          text: 'Fold both squares the same way. A corner toward you. Fold the top and bottom corners behind, just under a third of the way to the centre.',
          actions: [
            { from: [-1, 1 - CUT], to: [1, 1 - CUT], mover: [0, 1], kind: 'mountain', bend: -1 },
            { from: [-1, CUT - 1], to: [1, CUT - 1], mover: [0, -1], kind: 'mountain', bend: 1 },
          ],
        },
        {
          text: 'Fold the side corners behind the same way: a round snowball.',
          actions: [
            { from: [1 - CUT, -1], to: [1 - CUT, 1], mover: [1, 0], kind: 'mountain', bend: 1 },
            { from: [CUT - 1, -1], to: [CUT - 1, 1], mover: [-1, 0], kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
    {
      id: 'scarf',
      name: 'Scarf',
      kanji: '襟巻',
      tone: 'scarf',
      paper: `${size(SCARF)} cm square, red on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the top corner down to the bottom corner.',
          actions: [HALVE_DOWN],
        },
        {
          text: 'Fold the top edge down a little to make the band.',
          actions: [{ from: [1, -BAND], to: [-1, -BAND], mover: [0, 0], kind: 'valley', bend: 1 }],
        },
      ],
    },
  ],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'ball', seat: BODY_SEAT },
    steps: [
      {
        text: 'Glue the small snowball on top of the big one, overlapping a little.',
        actions: [{ kind: 'join', part: 'ball', seat: HEAD_SEAT, scale: HEAD }],
      },
      {
        text: 'Glue the scarf across the neck, its point hanging down over the body.',
        actions: [{ kind: 'join', part: 'scarf', seat: SCARF_SEAT, scale: SCARF }],
      },
      {
        text: 'Draw the eyes, a carrot nose, a smile and three buttons.',
        actions: [{ kind: 'draw', strokes: [...face, ...buttons] }],
      },
    ],
  },
}
