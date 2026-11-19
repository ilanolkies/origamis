import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
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
  name: say('Snowman', 'Muñeco de nieve'),
  kana: 'ゆきだるま',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  paper: say(`${size(1)}, ${size(HEAD)} and ${size(SCARF)} cm paper`, `papel de ${size(1)}, ${size(HEAD)} y ${size(SCARF)} cm`),
  parts: [
    {
      id: 'ball',
      name: say('Snowball', 'Bola de nieve'),
      kanji: '雪玉',
      tone: 'snow',
      copies: 2,
      paper: say(`${size(1)} and ${size(HEAD)} cm white squares`, `cuadrados blancos de ${size(1)} y ${size(HEAD)} cm`),
      steps: [
        {
          text: say('Fold both squares the same way. A corner toward you. Fold the top and bottom corners behind, just under a third of the way to the centre.', 'Dobla los dos cuadrados de la misma manera. Una esquina hacia ti. Dobla las esquinas de arriba y de abajo hacia atrás, un poco menos de un tercio del camino hacia el centro.'),
          actions: [
            { from: [-1, 1 - CUT], to: [1, 1 - CUT], mover: [0, 1], kind: 'mountain', bend: -1 },
            { from: [-1, CUT - 1], to: [1, CUT - 1], mover: [0, -1], kind: 'mountain', bend: 1 },
          ],
        },
        {
          text: say('Fold the side corners behind the same way: a round snowball.', 'Dobla las esquinas laterales hacia atrás de la misma manera: una bola de nieve redonda.'),
          actions: [
            { from: [1 - CUT, -1], to: [1 - CUT, 1], mover: [1, 0], kind: 'mountain', bend: 1 },
            { from: [CUT - 1, -1], to: [CUT - 1, 1], mover: [-1, 0], kind: 'mountain', bend: -1 },
          ],
        },
      ],
    },
    {
      id: 'scarf',
      name: say('Scarf', 'Bufanda'),
      kanji: '襟巻',
      tone: 'scarf',
      paper: say(`${size(SCARF)} cm square, red on one side`, `cuadrado de ${size(SCARF)} cm, rojo de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the top corner down to the bottom corner.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de arriba hacia la esquina de abajo.'),
          actions: [HALVE_DOWN],
        },
        {
          text: say('Fold the top edge down a little to make the band.', 'Dobla un poco el borde de arriba hacia abajo para hacer la banda.'),
          actions: [{ from: [1, -BAND], to: [-1, -BAND], mover: [0, 0], kind: 'valley', bend: 1 }],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'ball', seat: BODY_SEAT },
    steps: [
      {
        text: say('Glue the small snowball on top of the big one, overlapping a little.', 'Pega la bola de nieve pequeña encima de la grande, superponiéndolas un poco.'),
        actions: [{ kind: 'join', part: 'ball', seat: HEAD_SEAT, scale: HEAD }],
      },
      {
        text: say('Glue the scarf across the neck, its point hanging down over the body.', 'Pega la bufanda alrededor del cuello, con su punta colgando sobre el cuerpo.'),
        actions: [{ kind: 'join', part: 'scarf', seat: SCARF_SEAT, scale: SCARF }],
      },
      {
        text: say('Draw the eyes, a carrot nose, a smile and three buttons.', 'Dibuja los ojos, una nariz de zanahoria, una sonrisa y tres botones.'),
        actions: [{ kind: 'draw', strokes: [...face, ...buttons] }],
      },
    ],
  },
}
