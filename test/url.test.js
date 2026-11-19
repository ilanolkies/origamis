import assert from 'node:assert/strict'
import { test } from 'node:test'
import { query, stepIn } from '../src/url.js'

test('query sets and removes parameters while keeping the others', () => {
  assert.equal(query('?lang=es', '/', { model: 'tulip', step: 3 }), '?lang=es&model=tulip&step=3')
  assert.equal(query('?lang=es&model=tulip&step=3', '/', { model: null, step: null }), '?lang=es')
  assert.equal(query('?lang=es&step=2', '/', { step: 5 }), '?lang=es&step=5')
})

test('query falls back to the path when nothing is left', () => {
  assert.equal(query('?model=tulip', '/origamis/', { model: null }), '/origamis/')
})

test('the step in the URL is clamped between the first step and done', () => {
  assert.equal(stepIn('', 6), 1)
  assert.equal(stepIn('?step=3', 6), 3)
  assert.equal(stepIn('?step=7', 6), 7)
  assert.equal(stepIn('?step=99', 6), 7)
  assert.equal(stepIn('?step=0', 6), 1)
  assert.equal(stepIn('?step=abc', 6), 1)
  assert.equal(stepIn('?step=2.5', 6), 1)
})
