import assert from 'node:assert/strict'
import { test } from 'node:test'
import { area, check, fold, sheet } from '../src/fold.js'
import { tulip } from '../src/models/tulip.js'

for (const part of tulip.parts) {
  test(`${part.id} folds flat without tearing or piercing`, () => {
    const sheetArea = Math.abs(area(tulip.sheet))
    let faces = sheet(tulip.sheet)
    for (const step of part.steps) {
      for (const crease of step.folds) {
        faces = fold(faces, crease).faces
        const report = check(faces, sheetArea)
        assert.ok(report.areaError < 1e-9)
        assert.equal(report.tears, 0)
        assert.equal(report.pierced, 0)
      }
    }
  })
}
