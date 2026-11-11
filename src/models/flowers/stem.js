import { add, polar } from '../../geometry.js'
import { DIAMOND, SIDE_CM } from '../shapes.js'

const TOP = [0, 1]

export const stem = {
  id: 'stem',
  name: 'Stem',
  kana: 'くき',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'stem',
      name: 'Stem',
      kanji: '茎',
      tone: 'leaf',
      paper: `${SIDE_CM} cm square, green on one side`,
      steps: [
        {
          text: 'White side up, a corner pointing up. Fold the two upper edges in to the centre line.',
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
          text: 'Fold in half lengthwise, left side over right.',
          actions: [{ from: [0, -1], to: [0, 1], mover: [-0.3318, -0.6682], kind: 'valley', bend: -1 }],
        },
      ],
    },
  ],
}
