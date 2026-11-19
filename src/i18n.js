export const NAMES = { en: 'English', es: 'Español' }

export const LANGS = Object.keys(NAMES)

const browser = globalThis.window

const stored = () => {
  try {
    return browser?.localStorage.getItem('lang')
  } catch {
    return null
  }
}

export const choose = (search, saved, preferred) =>
  [new URLSearchParams(search).get('lang'), saved, preferred?.slice(0, 2)].find(code => LANGS.includes(code)) ?? 'en'

export const lang = choose(browser?.location.search, stored(), browser?.navigator.language)

export const setLang = code => {
  try {
    browser.localStorage.setItem('lang', code)
  } catch {
    return
  }
}

export const say = (en, es) => ({ en, es })

export const t = (text, code = lang) => text[code]

const unit = (one, many) => count => `<b>${count}</b> ${count === 1 ? one : many}`

export const ui = {
  en: {
    title: 'Origami 折り紙',
    language: 'Language',
    stepsLabel: 'Folding steps',
    partsLabel: 'Parts and steps',
    previous: 'Previous step',
    next: 'Next step',
    pieces: unit('piece', 'pieces'),
    steps: unit('step', 'steps'),
    minutes: 'min',
    difficulty: 'Difficulty',
    difficultyLabel: (level, levels) => `Difficulty ${level} of ${levels}`,
    paper: size => `${size} cm paper`,
    bothPieces: 'Both pieces',
    allPieces: count => `All ${count} pieces`,
    step: (current, total) => `Step ${current} / ${total}`,
    done: name => `Your ${name.toLowerCase()} is done.`,
    animation: name => `Animated folding of the ${name.toLowerCase()}`,
    tools: { none: 'none', pen: 'pen', glue: 'glue', scissors: 'scissors' },
    categories: {
      Flowers: 'Flowers',
      Animals: 'Animals',
      'Animal faces': 'Animal faces',
      Food: 'Food',
      Vehicles: 'Vehicles',
      Seasonal: 'Seasonal',
      Insects: 'Insects',
      Things: 'Things',
    },
  },
  es: {
    title: 'Origami 折り紙',
    language: 'Idioma',
    stepsLabel: 'Pasos de plegado',
    partsLabel: 'Piezas y pasos',
    previous: 'Paso anterior',
    next: 'Paso siguiente',
    pieces: unit('pieza', 'piezas'),
    steps: unit('paso', 'pasos'),
    minutes: 'min',
    difficulty: 'Dificultad',
    difficultyLabel: (level, levels) => `Dificultad ${level} de ${levels}`,
    paper: size => `papel de ${size} cm`,
    bothPieces: 'Las dos piezas',
    allPieces: count => `Las ${count} piezas`,
    step: (current, total) => `Paso ${current} / ${total}`,
    done: name => `Terminaste tu ${name.toLowerCase()}.`,
    animation: name => `Plegado animado de ${name.toLowerCase()}`,
    tools: { none: 'ninguna', pen: 'bolígrafo', glue: 'pegamento', scissors: 'tijeras' },
    categories: {
      Flowers: 'Flores',
      Animals: 'Animales',
      'Animal faces': 'Caras de animales',
      Food: 'Comida',
      Vehicles: 'Vehículos',
      Seasonal: 'De temporada',
      Insects: 'Insectos',
      Things: 'Objetos',
    },
  },
}
