import { catFace } from './animal-faces/cat.js'
import { dogFace } from './animal-faces/dog.js'
import { fox } from './animal-faces/fox.js'
import { pig } from './animal-faces/pig.js'
import { rabbit } from './animal-faces/rabbit.js'
import { cat } from './animals/cat.js'
import { dog } from './animals/dog.js'
import { flappingBird } from './animals/flapping-bird.js'
import { swan } from './animals/swan.js'
import { whale } from './animals/whale.js'
import { cherryBlossom } from './flowers/cherry-blossom.js'
import { leaf } from './flowers/leaf.js'
import { stem } from './flowers/stem.js'
import { sunflower } from './flowers/sunflower.js'
import { tulip } from './flowers/tulip.js'
import { carrot } from './food/carrot.js'
import { iceCream } from './food/ice-cream.js'
import { nigiri } from './food/nigiri.js'
import { onigiri } from './food/onigiri.js'
import { watermelon } from './food/watermelon.js'
import { cicada } from './insects/cicada.js'
import { christmasTree } from './seasonal/christmas-tree.js'
import { fuji } from './seasonal/fuji.js'
import { heart } from './seasonal/heart.js'
import { snowman } from './seasonal/snowman.js'
import { cup } from './things/cup.js'
import { helmet } from './things/helmet.js'
import { house } from './things/house.js'
import { piano } from './things/piano.js'
import { rocket } from './vehicles/rocket.js'
import { sailboat } from './vehicles/sailboat.js'

export const categories = {
  Flowers: [tulip, leaf, stem, cherryBlossom, sunflower],
  Animals: [cat, dog, whale, swan, flappingBird],
  'Animal faces': [catFace, dogFace, fox, rabbit, pig],
  Food: [watermelon, onigiri, carrot, iceCream, nigiri],
  Vehicles: [sailboat, rocket],
  Seasonal: [fuji, christmasTree, snowman, heart],
  Insects: [cicada],
  Things: [helmet, cup, house, piano],
}

export const models = Object.values(categories).flat()

export const categoryOf = model => Object.keys(categories).find(name => categories[name].includes(model))
