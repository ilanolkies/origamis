import { add, polar } from '../../geometry.js'
import { arc, cm, DIAMOND, edgeReach, HALVE_UP, SIDE_CM } from '../shapes.js'

const TOP = [0, 1]
const BASE = add(TOP, polar(281.25, 2 * edgeReach(78.75)))[1]
const SHOULDER = 0.5
const FIN = 0.65
const DROP = 0.05

export const rocket = {
  id: 'rocket',
  name: 'Rocket',
  kana: 'ロケット',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'body',
      name: 'Body',
      kanji: '胴',
      tone: 'rocket',
      paper: `${SIDE_CM} cm square, red on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the two upper edges in to the centre line.',
          actions: [
            { from: TOP, to: add(TOP, polar(292.5)), mover: [1, 0], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(247.5)), mover: [-1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: 'Fold the long folded edges in to the centre line again.',
          actions: [
            { from: TOP, to: add(TOP, polar(281.25)), mover: [0.55, -0.4], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(258.75)), mover: [-0.55, -0.4], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: 'Fold the bottom point behind along the line between the side corners. The white tip left showing is the flame.',
          actions: [{ from: [-1, BASE], to: [1, BASE], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: 'Draw a round window.',
          actions: [{ kind: 'draw', strokes: [arc([0, 0.2], 0.08, 0, 360, 12)] }],
        },
      ],
    },
    {
      id: 'fins',
      name: 'Fins',
      kanji: '翼',
      tone: 'fins',
      paper: `${SIDE_CM} cm square, blue on one side`,
      steps: [
        {
          text: 'New sheet, white side up, a corner toward you. Fold the bottom corner up to the top corner.',
          actions: [HALVE_UP],
        },
        {
          text: `Fold the top point behind, ${cm(1 - SHOULDER)} cm down from the tip.`,
          actions: [{ from: [-1, SHOULDER], to: [1, SHOULDER], mover: [0, 1], kind: 'mountain', bend: 1 }],
        },
        {
          text: `Fold the side tips behind along upright creases ${cm(1 - FIN)} cm in.`,
          actions: [
            { from: [-FIN, 0], to: [-FIN, 1], mover: [-1, 0], kind: 'mountain', bend: 1 },
            { from: [FIN, 0], to: [FIN, 1], mover: [1, 0], kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
  ],
  finish: {
    name: 'Finish',
    kanji: '完成',
    base: 'fins',
    top: 'body',
    seat: [0, -BASE - DROP],
    text: 'Glue the body over the middle of the fins, its bottom edge level with theirs.',
  },
}
