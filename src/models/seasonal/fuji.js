import { cm, DIAMOND, HALVE_UP, SIDE_CM } from '../shapes.js'

const SNOW = -0.7

export const fuji = {
  id: 'fuji',
  name: 'Mt Fuji',
  kana: 'ふじさん',
  sheet: DIAMOND,
  sheetCm: SIDE_CM,
  parts: [
    {
      id: 'mountain',
      name: 'Mountain',
      kanji: '山',
      tone: 'fuji',
      paper: `${SIDE_CM} cm square, blue on one side`,
      steps: [
        {
          text: `White side up, a corner toward you. Fold the bottom corner behind, ${cm(1 + SNOW)} cm up from the tip.`,
          actions: [{ from: [-1, SNOW], to: [1, SNOW], mover: [0, -1], kind: 'mountain', bend: 1 }],
        },
        {
          text: 'Fold the bottom half up along the middle. The white tip comes up on top as the snowcap.',
          actions: [HALVE_UP],
        },
      ],
    },
  ],
}
