import { add, polar } from '../../geometry.js'
import { say } from '../../i18n.js'
import { DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const TIP = 0.12

const blunt = (corner, inward, bend) => {
  const from = add(corner, polar(inward, TIP))
  return { from, to: add(from, polar(inward + 90)), mover: corner, kind: 'mountain', bend }
}
const TIERS = [
  { scale: 1, seat: [0, 0] },
  { scale: 0.8, seat: [0, 0.45] },
  { scale: 0.6, seat: [0, 0.9] },
]
const TRUNK = 0.6
const SIZES = TIERS.map(tier => Math.round(tier.scale * SIDE_CM))
const PEAK = TIERS.at(-1).seat[1] + TIERS.at(-1).scale
const STAR = add([0, PEAK], [0, 0.04])

const star = [
  Array.from({ length: 11 }, (_, i) => add(STAR, polar(90 + i * 144, 0.13))),
]
const baubles = [[-0.5, 0.15], [0.45, 0.25], [-0.3, 0.62], [0.32, 0.75], [-0.1, 1.1]].map(spot =>
  Array.from({ length: 9 }, (_, i) => add(spot, polar(i * 45, 0.035))),
)

export const christmasTree = {
  id: 'christmas-tree',
  name: say('Christmas tree', 'Árbol de Navidad'),
  kana: 'クリスマスツリー',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  paper: say(`${SIZES.join(', ')} and ${Math.round(TRUNK * SIDE_CM)} cm paper`, `papel de ${SIZES.join(', ')} y ${Math.round(TRUNK * SIDE_CM)} cm`),
  parts: [
    {
      id: 'tier',
      name: say('Tier', 'Nivel'),
      kanji: '枝',
      tone: 'pine',
      copies: TIERS.length,
      paper: say(`${SIZES.slice(0, -1).join(', ')} and ${SIZES.at(-1)} cm squares, green on one side`, `cuadrados de ${SIZES.slice(0, -1).join(', ')} y ${SIZES.at(-1)} cm, verde de un lado`),
      steps: [
        {
          text: say('Fold each of the three squares the same way. White side up, a corner toward you. Fold the bottom corner up to the top corner.', 'Dobla los tres cuadrados de la misma manera. Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia la esquina de arriba.'),
          actions: [HALVE_UP],
        },
        {
          text: say('Fold the two side tips behind a little to blunt them.', 'Dobla un poco las dos puntas laterales hacia atrás para despuntarlas.'),
          actions: [blunt([1, 0], 157.5, 1), blunt([-1, 0], 22.5, -1)],
        },
      ],
    },
    {
      id: 'trunk',
      name: say('Trunk', 'Tronco'),
      kanji: '幹',
      tone: 'wood',
      paper: say(`${Math.round(TRUNK * SIDE_CM)} cm square, brown on one side`, `cuadrado de ${Math.round(TRUNK * SIDE_CM)} cm, marrón de un lado`),
      steps: [
        {
          text: say('New sheet, white side up, a corner toward you. Fold the side corners in to the centre.', 'Hoja nueva, lado blanco hacia arriba, una esquina hacia ti. Dobla las esquinas laterales hacia el centro.'),
          actions: [
            { from: [-0.5, -1], to: [-0.5, 1], mover: [-1, 0], kind: 'valley', bend: 1 },
            { from: [0.5, -1], to: [0.5, 1], mover: [1, 0], kind: 'valley', bend: -1 },
          ],
        },
        {
          text: say('Fold the top and bottom corners in to the centre too: a small square.', 'Dobla también las esquinas de arriba y de abajo hacia el centro: un cuadrado pequeño.'),
          actions: [
            { from: [-1, 0.5], to: [1, 0.5], mover: [0, 1], kind: 'valley', bend: -1 },
            { from: [-1, -0.5], to: [1, -0.5], mover: [0, -1], kind: 'valley', bend: 1 },
          ],
        },
        {
          text: say('Fold the left and right edges in to the middle: a narrow trunk.', 'Dobla los bordes izquierdo y derecho hacia el medio: un tronco angosto.'),
          actions: [
            { from: [-0.25, -1], to: [-0.25, 1], mover: [-0.5, 0], kind: 'valley', bend: 1 },
            { from: [0.25, -1], to: [0.25, 1], mover: [0.5, 0], kind: 'valley', bend: -1 },
          ],
        },
      ],
    },
  ],
  assembly: {
    name: say('Finish', 'Acabado'),
    kanji: '完成',
    base: { part: 'trunk', seat: [0, -0.15], scale: TRUNK },
    steps: [
      {
        text: say('Glue the biggest tier over the top of the trunk, so the trunk peeks out below.', 'Pega el nivel más grande sobre la parte de arriba del tronco, de modo que el tronco asome por debajo.'),
        actions: [{ kind: 'join', part: 'tier', ...TIERS[0] }],
      },
      {
        text: say('Glue the middle tier over the top of the big one, then the smallest over the top of the middle one.', 'Pega el nivel del medio sobre la parte de arriba del grande, y luego el más pequeño sobre la parte de arriba del del medio.'),
        actions: TIERS.slice(1).map(tier => ({ kind: 'join', part: 'tier', ...tier })),
      },
      {
        text: say('Draw a star on the top and a few baubles on the branches.', 'Dibuja una estrella arriba y algunas bolitas en las ramas.'),
        actions: [{ kind: 'draw', strokes: [...star, ...baubles] }],
      },
    ],
  },
}
