import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { models } from './models.js'
import { pose, timeline } from './paper.js'

const STEP_MS = 1400
const TABLE = 0xcfc6b4
const WHITE = 0xf8f4ea
const COLOUR = 0xd1432f

const stage = document.querySelector('#stage')
const nav = document.querySelector('#models')
const caption = document.querySelector('#caption')
const scrub = document.querySelector('#scrub')
const previous = document.querySelector('#previous')
const next = document.querySelector('#next')
const play = document.querySelector('#play')

// --- scene: a table, a lamp, and paper that is white on top, coloured below ---

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
stage.append(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(TABLE)

const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 20)
camera.up.set(0, 0, 1)
camera.position.set(0.8, -1.5, 1.1)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0.1)
controls.enableDamping = true
controls.minDistance = 0.6
controls.maxDistance = 5

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f6c, 1.5))
const lamp = new THREE.DirectionalLight(0xfff4e0, 2.2)
lamp.position.set(1.2, -0.9, 2.4)
lamp.castShadow = true
lamp.shadow.mapSize.set(2048, 2048)
lamp.shadow.bias = -0.0004
lamp.shadow.normalBias = 0.004
Object.assign(lamp.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5, near: 0.1, far: 6 })
scene.add(lamp)

const table = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: TABLE, roughness: 1 }),
)
table.receiveShadow = true
scene.add(table)

function grain() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')
  context.fillStyle = '#808080'
  context.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 5000; i++) {
    const shade = 110 + Math.random() * 40
    context.strokeStyle = `rgb(${shade}, ${shade}, ${shade})`
    const x = Math.random() * 256
    const y = Math.random() * 256
    const turn = Math.random() * Math.PI
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + Math.cos(turn) * 7, y + Math.sin(turn) * 7)
    context.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  return texture
}

const fibres = grain()
const side = (color, face) =>
  new THREE.MeshStandardMaterial({
    color,
    side: face,
    roughness: 0.95,
    bumpMap: fibres,
    bumpScale: 0.6,
    shadowSide: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })

const paper = new THREE.Group()
const top = new THREE.Mesh(new THREE.BufferGeometry(), side(WHITE, THREE.FrontSide))
const bottom = new THREE.Mesh(new THREE.BufferGeometry(), side(COLOUR, THREE.BackSide))
const edges = new THREE.LineSegments(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ color: 0x2b2620, transparent: true, opacity: 0.45 }),
)
top.castShadow = top.receiveShadow = bottom.receiveShadow = true
paper.add(top, bottom, edges)
scene.add(paper)

function show(faces) {
  const positions = []
  const uvs = []
  const lines = []
  let lowest = Infinity
  for (const { uv, at } of faces) {
    for (let i = 1; i < at.length - 1; i++) {
      for (const corner of [0, i, i + 1]) {
        positions.push(...at[corner])
        uvs.push(...uv[corner])
      }
    }
    at.forEach((point, i) => {
      lines.push(...point, ...at[(i + 1) % at.length])
      lowest = Math.min(lowest, point[2])
    })
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()
  top.geometry.dispose()
  edges.geometry.dispose()
  top.geometry = bottom.geometry = geometry
  edges.geometry = new THREE.BufferGeometry()
  edges.geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3))
  // The paper rests on the table: whatever folds underneath lifts the rest.
  paper.position.z = 0.002 - lowest
}

// --- player: `progress` runs from 0 to the number of steps ---

const ease = t => t * t * (3 - 2 * t)
let steps = []
let progress = 0
let target = 0

function draw() {
  const index = Math.min(Math.floor(progress), steps.length - 1)
  const step = steps[index]
  const t = ease(progress - index)
  show(pose(step, t))
  const kind = step.angle > 0 ? 'valley' : 'mountain'
  const degrees = Math.round(Math.abs(step.angle) * t)
  caption.textContent = `${index + 1}/${steps.length} · ${step.text} (${kind}, ${degrees}° of ${Math.abs(step.angle)}°)`
  scrub.value = progress
  previous.disabled = progress <= 0
  next.disabled = progress >= steps.length
}

function open(model) {
  steps = timeline(model)
  progress = target = 0
  scrub.max = steps.length
  for (const button of nav.children) button.setAttribute('aria-pressed', button.dataset.id === model.id)
  history.replaceState(null, '', `?model=${model.id}`)
  draw()
}

for (const model of models) {
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.id = model.id
  button.textContent = model.name
  button.addEventListener('click', () => open(model))
  nav.append(button)
}

scrub.addEventListener('input', () => {
  progress = target = Number(scrub.value)
  draw()
})
previous.addEventListener('click', () => (target = Math.max(0, Math.ceil(progress) - 1)))
next.addEventListener('click', () => (target = Math.min(steps.length, Math.floor(progress) + 1)))
play.addEventListener('click', () => {
  if (progress >= steps.length) progress = 0
  target = steps.length
})

new ResizeObserver(() => {
  const { clientWidth: width, clientHeight: height } = stage
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}).observe(stage)

let last = performance.now()
renderer.setAnimationLoop(now => {
  const reach = (now - last) / STEP_MS
  last = now
  if (progress !== target) {
    progress += Math.max(-reach, Math.min(reach, target - progress))
    draw()
  }
  controls.update()
  renderer.render(scene, camera)
})

const wanted = new URLSearchParams(location.search).get('model')
open(models.find(model => model.id === wanted) ?? models[0])
