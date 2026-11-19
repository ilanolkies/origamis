import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { DIAMOND, mirror, SIDE_CM } from '../shapes.js'

const TOP = [0, 1]
const BOTTOM = [0, -1]

const vein = y => [[0, y], [0.2, y + 0.15]]
const veins = [0.2, -0.2, -0.55].map(vein)

const lines = [[[0, -0.95], [0, 0.95]], ...veins, ...veins.map(stroke => stroke.map(mirror))]

export const leaf = {
  id: 'leaf',
  name: say('Leaf', 'Hoja'),
  kana: 'は',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'leaf',
      name: say('Leaf', 'Hoja'),
      kanji: '葉',
      tone: 'leaf',
      paper: say(`${SIDE_CM} cm square, green on one side`, `cuadrado de ${SIDE_CM} cm, verde de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold the two lower edges in to the centre line.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla los dos bordes de abajo hacia la línea central.'),
          actions: [
            { from: BOTTOM, to: add(BOTTOM, polar(67.5)), mover: [1, 0], kind: 'valley', bend: -1 },
            { from: BOTTOM, to: add(BOTTOM, polar(112.5)), mover: [-1, 0], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Fold the two upper edges in to the centre line too.', 'Dobla también los dos bordes de arriba hacia la línea central.'),
          actions: [
            { from: TOP, to: add(TOP, polar(292.5)), mover: [0.4, 0.4], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(247.5)), mover: [-0.4, 0.4], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: say('Draw the middle vein and a few side veins.', 'Dibuja la nervadura del medio y algunas nervaduras laterales.'),
          actions: [{ kind: 'draw', strokes: lines }],
        },
      ],
    },
  ],
}
