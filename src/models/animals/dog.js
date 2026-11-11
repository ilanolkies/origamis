import { add, polar } from '../../geometry.js'
import { head } from '../animal-faces/dog.js'
import { CM, cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TAIL_START = [0.2, 0]
const TAIL_ANGLE = 40
const CHEST = -0.45
const NECK_DEPTH = 0.5

export const dog = {
  id: 'dog',
  name: 'Sitting dog',
  kana: 'いぬ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    head,
    {
      id: 'body',
      name: 'Body',
      kanji: '体',
      tone: 'dog',
      paper: `${SIDE_CM} cm square, brown on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the bottom corner up to the top corner.',
          actions: [HALVE_UP],
        },
        {
          text: `Fold the right corner up to make the tail. Start the crease ${cm(TAIL_START[0])} cm right of the middle of the bottom edge and slant it up to the right edge.`,
          actions: [
            { from: TAIL_START, to: add(TAIL_START, polar(TAIL_ANGLE)), mover: [1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: `Fold the left corner behind along an upright crease ${cm(1 + CHEST)} cm from the tip.`,
          actions: [{ from: [CHEST, 0], to: [CHEST, 1], mover: [-1, 0], kind: 'mountain', bend: 1 }],
        },
      ],
    },
  ],
  assembly: {
    name: 'Finish',
    kanji: '完成',
    base: { part: 'body' },
    steps: [
      {
        text: `Slide the body's top point about ${Math.round(NECK_DEPTH * CM)} cm up behind the face. A dab of glue keeps it in place.`,
        actions: [{ kind: 'join', part: 'face', seat: [0, 2 - NECK_DEPTH] }],
      },
    ],
  },
}
