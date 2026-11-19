import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { DIAMOND, SIDE_CM } from '../shapes.js'

const TOP = [0, 1]

export const stem = {
  id: 'stem',
  name: say('Stem', 'Tallo'),
  kana: 'くき',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'stem',
      name: say('Stem', 'Tallo'),
      kanji: '茎',
      tone: 'leaf',
      paper: say(`${SIDE_CM} cm square, green on one side`, `cuadrado de ${SIDE_CM} cm, verde de un lado`),
      steps: [
        {
          text: say('White side up, a corner pointing up. Fold the two upper edges in to the centre line.', 'Lado blanco hacia arriba, una esquina hacia arriba. Dobla los dos bordes de arriba hacia la línea central.'),
          actions: [
            { from: TOP, to: add(TOP, polar(292.5)), mover: [1, 0], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(247.5)), mover: [-1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: say('Fold the long folded edges in to the centre line again.', 'Dobla de nuevo los bordes largos doblados hacia la línea central.'),
          actions: [
            { from: TOP, to: add(TOP, polar(281.25)), mover: [0.55, -0.4], kind: 'valley', bend: 1 },
            { from: TOP, to: add(TOP, polar(258.75)), mover: [-0.55, -0.4], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: say('Fold in half lengthwise, left side over right.', 'Dobla por la mitad a lo largo, el lado izquierdo sobre el derecho.'),
          actions: [{ from: [0, -1], to: [0, 1], mover: [-0.3318, -0.6682], kind: 'valley', bend: -1 }],
        },
      ],
    },
  ],
}
