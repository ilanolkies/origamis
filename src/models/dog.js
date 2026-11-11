import { arc, cm, DIAMOND, HALVE_DOWN, mirror, SIDE_CM } from './shapes.js'

const EAR_TOP = [-0.55, 0]
const EAR_EDGE = [-0.8, -0.2]

const whole = strokes => [...strokes, ...strokes.map(stroke => stroke.map(mirror))]

const face = [
  ...whole([arc([-0.22, -0.2], 0.05, 0, 360, 10)]),
  [[-0.08, -0.5], [0.08, -0.5], [0, -0.62], [-0.08, -0.5]],
  [[0, -0.62], [0, -0.68]],
  [[0, -0.68], ...arc([-0.07, -0.68], 0.07, 0, -180, 6)],
  [[0, -0.68], ...arc([0.07, -0.68], 0.07, 180, 360, 6)],
  arc([0.22, -0.2], 0.11, 0, 360, 12),
]

export const dog = {
  id: 'dog-face',
  name: 'Dog face',
  kana: 'いぬ',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'face',
      name: 'Face',
      kanji: '顔',
      tone: 'dog',
      paper: `${SIDE_CM} cm square, brown on one side`,
      steps: [
        {
          text: 'White side up, a corner toward you. Fold the top corner down to the bottom corner.',
          actions: [HALVE_DOWN],
        },
        {
          text: `Fold the left corner down to make a floppy ear. The crease runs from ${cm(-EAR_TOP[0])} cm left of the middle of the top edge to a spot ${cm(-EAR_EDGE[1])} cm down the left edge.`,
          actions: [{ from: EAR_TOP, to: EAR_EDGE, mover: [-1, 0], kind: 'valley', bend: 1 }],
        },
        {
          text: 'Repeat on the right. The two ears should hang level.',
          actions: [{ from: mirror(EAR_TOP), to: mirror(EAR_EDGE), mover: [1, 0], kind: 'valley', bend: -1 }],
        },
        {
          text: 'Draw the face: two eyes, a big nose, a smile and a patch around one eye.',
          actions: [{ kind: 'draw', strokes: face }],
        },
      ],
    },
  ],
}
