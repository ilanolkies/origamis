import assert from 'node:assert/strict'
import { test } from 'node:test'
import { area, check, fold, sheet } from '../src/fold.js'
import { models } from '../src/models/index.js'

for (const model of models) {
  for (const part of model.parts) {
    test(`${model.id} ${part.id} folds flat without tearing or piercing`, () => {
      const sheetArea = Math.abs(area(model.sheet))
      let faces = sheet(model.sheet)
      for (const step of part.steps) {
        for (const crease of step.folds ?? []) {
          const result = fold(faces, crease)
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
