import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actions, difficultyOf, kindsOf, LEVELS } from '../src/actions/index.js'
import { fold } from '../src/actions/fold.js'
import { area, check, sheet } from '../src/geometry.js'
import catalog from '../src/models/catalog.json' with { type: 'json' }
import places from '../src/models/categories.json' with { type: 'json' }
import { categories, models } from '../src/models/index.js'

test('every category has a place on the board and every model a catalog entry', () => {
  assert.deepEqual(Object.keys(places).sort(), Object.keys(categories).sort())
  for (const model of models) assert.ok(catalog[model.id], `missing catalog entry for ${model.id}`)
})

const creases = new Set(['valley', 'mountain'])

for (const model of models) {
  test(`${model.id} only uses registered actions`, () => {
    for (const kind of kindsOf(model)) assert.ok(actions[kind], `unknown action ${kind}`)
    assert.ok(difficultyOf(model) >= 1 && difficultyOf(model) <= LEVELS)
  })

  for (const part of model.parts) {
    test(`${model.id} ${part.id} folds flat without tearing or piercing`, () => {
      const sheetArea = Math.abs(area(model.sheet))
      let faces = sheet(model.sheet)
      for (const step of part.steps) {
        for (const action of step.actions.filter(action => creases.has(action.kind))) {
          const result = fold(faces, action)
          assert.ok(result.moving.length > 0)
          faces = result.faces
          const report = check(faces, sheetArea)
          assert.ok(report.areaError < 1e-9)
          assert.equal(report.tears, 0)
          assert.equal(report.pierced, 0)
        }
      }
    })
  }
}
