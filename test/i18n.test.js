import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LANGS, t, ui } from '../src/i18n.js'
import catalog from '../src/models/catalog.json' with { type: 'json' }
import { categories, models } from '../src/models/index.js'

const textsOf = model => [
  model.name,
  model.paper,
  ...model.parts.flatMap(part => [part.name, part.paper, ...part.steps.map(step => step.text)]),
  ...(model.assembly ? [model.assembly.name, ...model.assembly.steps.map(step => step.text)] : []),
]

for (const model of models) {
  test(`${model.id} has its name, papers and steps in every language`, () => {
    for (const text of textsOf(model).filter(Boolean)) {
      for (const code of LANGS) assert.ok(t(text, code)?.trim(), `${model.id} lacks ${code}: ${JSON.stringify(text)}`)
    }
  })

  test(`${model.id} steps are written differently in each language`, () => {
    const steps = [...model.parts.flatMap(part => part.steps), ...(model.assembly?.steps ?? [])]
    for (const step of steps) assert.notEqual(t(step.text, 'es'), t(step.text, 'en'))
  })
}

test('every language words the interface with the same keys', () => {
  const keys = code => Object.keys(ui[code]).sort()
  for (const code of LANGS) assert.deepEqual(keys(code), keys('en'))
})

test('every category and tool is named in every language', () => {
  const tools = new Set(Object.values(catalog).flatMap(facts => facts.tools))
  for (const code of LANGS) {
    for (const name of Object.keys(categories)) assert.ok(ui[code].categories[name], `${code} category ${name}`)
    for (const tool of tools) assert.ok(ui[code].tools[tool], `${code} tool ${tool}`)
  }
})

test('plurals follow each language', () => {
  assert.equal(ui.en.steps(1), '<b>1</b> step')
  assert.equal(ui.es.steps(3), '<b>3</b> pasos')
})
