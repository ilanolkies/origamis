import { add, polar, scale, sub } from '../../geometry.js'
import { say } from '../../i18n.js'
import { arc, cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const SQUARE = [[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]]
const POINTS = [[0.5, 0], [0, 0.5], [-0.5, 0], [0, -0.5]]
const ROUND = 0.8
const HEAD = 0.17
const SEEDS = 13
const GOLDEN = 137.5

const foldAt = (corner, share, kind, bend) => {
  const cut = scale(corner, share)
  const along = [-corner[1], corner[0]]
  return { from: sub(cut, along), to: add(cut, along), mover: corner, kind, bend }
}

const seeds = [
  arc([0, 0], HEAD, 0, 360, 16),
  ...Array.from({ length: SEEDS }, (_, k) => arc(polar(GOLDEN * k, 0.04 * Math.sqrt(k + 0.5)), 0.012, 0, 360, 6)),
]

export const sunflower = {
  id: 'sunflower',
  name: say('Sunflower', 'Girasol'),
  kana: 'ひまわり',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'flower',
      name: say('Flower', 'Flor'),
      kanji: '向日葵',
      tone: 'sun',
      paper: say(`${SIDE_CM} cm square, yellow on one side`, `cuadrado de ${SIDE_CM} cm, amarillo de un lado`),
      steps: [
        {
          text: say('White side up, a corner toward you. Fold in half corner to corner both ways, unfolding each time. The creases cross at the centre.', 'Lado blanco hacia arriba, una esquina hacia ti. Dobla por la mitad de esquina a esquina en los dos sentidos, desdoblando cada vez. Los pliegues se cruzan en el centro.'),
          actions: [
            { ...HALVE_UP, kind: 'crease' },
            { from: [0, -1], to: [0, 1], mover: [-1, 0], bend: -1, kind: 'crease' },
          ],
        },
        {
          text: say('Fold all four corners in to the centre.', 'Dobla las cuatro esquinas hacia el centro.'),
          actions: DIAMOND.map((corner, i) => foldAt(corner, 0.5, 'valley', i % 2 ? 1 : -1)),
        },
        {
          text: say('Fold the four new corners in to the centre again.', 'Dobla las cuatro esquinas nuevas hacia el centro otra vez.'),
          actions: SQUARE.map((corner, i) => foldAt(corner, 0.5, 'valley', i % 2 ? 1 : -1)),
        },
        {
          text: say(`Fold the tips of the four points behind by ${cm((1 - ROUND) * 0.5)} cm to round the flower.`, `Dobla hacia atrás ${cm((1 - ROUND) * 0.5)} cm las puntas de las cuatro esquinas para redondear la flor.`),
          actions: POINTS.map((corner, i) => foldAt(corner, ROUND, 'mountain', i % 2 ? 1 : -1)),
        },
        {
          text: say('Draw the seed head: a circle in the middle filled with seeds.', 'Dibuja el centro de semillas: un círculo en el medio lleno de semillas.'),
          actions: [{ kind: 'draw', strokes: seeds }],
        },
      ],
    },
  ],
}
