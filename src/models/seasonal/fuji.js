import { say } from '../../i18n.js'
import { cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const SNOW = -0.7

export const fuji = {
  id: 'fuji',
  name: say('Mt Fuji', 'Monte Fuji'),
  kana: 'ふじさん',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'mountain',
      name: say('Mountain', 'Montaña'),
      kanji: '山',
      tone: 'fuji',
      paper: say(`${SIDE_CM} cm square, blue on one side`, `cuadrado de ${SIDE_CM} cm, azul de un lado`),
      steps: [
        {
          text: say(`White side up, a corner toward you. Fold the bottom corner behind, ${cm(1 + SNOW)} cm up from the tip.`, `Lado blanco hacia arriba, una esquina hacia ti. Dobla la esquina de abajo hacia atrás, a ${cm(1 + SNOW)} cm de la punta.`),
          actions: [{ from: [-1, SNOW], to: [1, SNOW], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: say('Fold the bottom half up along the middle. The white tip comes up on top as the snowcap.', 'Dobla la mitad de abajo hacia arriba por el medio. La punta blanca queda arriba como la cima nevada.'),
          actions: [HALVE_UP],
        },
      ],
    },
  ],
}
