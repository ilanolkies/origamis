import { add, polar } from '../../geometry.js'
import { DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TIP = [1, 0]
const NECK = 0.2
const NECK_ANGLE = 47
const HEAD_ANGLE = 35
const TAIL = -0.55
const TAIL_ANGLE = 145

const neckTip = add([NECK, 0], polar(2 * NECK_ANGLE, 1 - NECK))
const throat = add(neckTip, polar(2 * NECK_ANGLE + 180, 0.2))

export const swan = {
  id: 'swan',
  name: 'Swan',
  kana: 'はくちょう',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'swan',
      name: 'Swan',
      kanji: '白鳥',
      tone: 'swan',
      paper: `${SIDE_CM} cm square, pale blue on one side`,
      steps: [
        {
          text: 'Coloured side down, a corner to the right. Fold the bottom corner up to the top corner and unfold.',
          actions: [{ ...HALVE_UP, kind: 'crease' }],
        },
        {
          text: 'Fold the two edges at the right corner in to the middle crease to make a kite.',
          actions: [
            { from: TIP, to: add(TIP, polar(157.5)), mover: [0.5, 0.5], kind: 'valley', bend: -1 },
            { from: TIP, to: add(TIP, polar(202.5)), mover: [0.5, -0.5], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: 'Turn over, top to bottom.',
          actions: [{ kind: 'turn', from: [0, 0], to: [1, 0] }],
        },
        {
          text: 'Fold the two edges at the right corner in to the middle again to narrow the kite.',
          actions: [
            { from: TIP, to: add(TIP, polar(168.75)), mover: [0.3, 0.3], kind: 'valley', bend: -1 },
            { from: TIP, to: add(TIP, polar(191.25)), mover: [0.3, -0.3], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: 'Fold the bottom half up along the middle crease.',
          actions: [HALVE_UP],
        },
        {
          text: 'Inside reverse fold the point up between the layers to make the neck.',
          actions: [{ kind: 'inside-reverse', from: [NECK, 0], to: add([NECK, 0], polar(NECK_ANGLE)), mover: TIP, bend: 1 }],
        },
        {
          text: 'Inside reverse fold the left point up between the layers to make the tail.',
          actions: [{ kind: 'inside-reverse', from: [TAIL, 0], to: add([TAIL, 0], polar(TAIL_ANGLE)), mover: [-1, 0], bend: -1 }],
        },
        {
          text: 'Inside reverse fold the top of the neck down to make the head.',
          actions: [{ kind: 'inside-reverse', from: throat, to: add(throat, polar(HEAD_ANGLE)), mover: neckTip, bend: -1 }],
        },
      ],
    },
  ],
}
