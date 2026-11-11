import { catFace } from './animal-faces/cat.js'
import { dog } from './animal-faces/dog.js'
import { fox } from './animal-faces/fox.js'
import { pig } from './animal-faces/pig.js'
import { rabbit } from './animal-faces/rabbit.js'
import { cat } from './animals/cat.js'
import { tulip } from './flowers/tulip.js'
import { carrot } from './food/carrot.js'
import { onigiri } from './food/onigiri.js'
import { watermelon } from './food/watermelon.js'

export const categories = {
  Flowers: [tulip],
  Animals: [cat],
  'Animal faces': [catFace, dog, fox, rabbit, pig],
  Food: [watermelon, onigiri, carrot],
}

export const models = Object.values(categories).flat()

export const categoryOf = model => Object.keys(categories).find(name => categories[name].includes(model))
