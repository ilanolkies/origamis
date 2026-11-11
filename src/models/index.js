import { catFace } from './animal-faces/cat.js'
import { dogFace } from './animal-faces/dog.js'
import { fox } from './animal-faces/fox.js'
import { pig } from './animal-faces/pig.js'
import { rabbit } from './animal-faces/rabbit.js'
import { cat } from './animals/cat.js'
import { dog } from './animals/dog.js'
import { whale } from './animals/whale.js'
import { leaf } from './flowers/leaf.js'
import { stem } from './flowers/stem.js'
import { tulip } from './flowers/tulip.js'
import { carrot } from './food/carrot.js'
import { iceCream } from './food/ice-cream.js'
import { nigiri } from './food/nigiri.js'
import { onigiri } from './food/onigiri.js'
import { watermelon } from './food/watermelon.js'
import { fuji } from './seasonal/fuji.js'
import { rocket } from './vehicles/rocket.js'
import { sailboat } from './vehicles/sailboat.js'

export const categories = {
  Flowers: [tulip, leaf, stem],
  Animals: [cat, dog, whale],
  'Animal faces': [catFace, dogFace, fox, rabbit, pig],
  Food: [watermelon, onigiri, carrot, iceCream, nigiri],
  Vehicles: [sailboat, rocket],
  Seasonal: [fuji],
}

export const models = Object.values(categories).flat()

export const categoryOf = model => Object.keys(categories).find(name => categories[name].includes(model))
