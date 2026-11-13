// Creases are drawn on the part of the paper still lying flat on the table.
// The side to the left of `from -> to` moves. angle > 0 valley, < 0 mountain.

const SQUARE = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]
const STRIP = [[-0.5, -0.2], [0.5, -0.2], [0.5, 0.2], [-0.5, 0.2]]
const DIAMOND = [[0.7, 0], [0, 0.7], [-0.7, 0], [0, -0.7]]

const book = {
  id: 'book',
  name: 'Book fold',
  sheet: [SQUARE],
  folds: [{ from: [0, -1], to: [0, 1], angle: 180, text: 'Valley fold the left half all the way over.' }],
}

const stand = {
  id: 'stand',
  name: 'Stand',
  sheet: [SQUARE],
  folds: [{ from: [0, -1], to: [0, 1], angle: 90, text: 'Same crease, but stop at a right angle.' }],
}

const STEPS = 6
const stairs = {
  id: 'stairs',
  name: 'Stairs',
  sheet: [STRIP],
  folds: Array.from({ length: STEPS - 1 }, (_, i) => {
    const x = 0.5 - (i + 1) / STEPS
    const valley = i % 2 === 0
    return {
      from: [x, 1],
      to: [x, -1],
      angle: valley ? 90 : -90,
      text: valley ? 'Valley fold up to a right angle.' : 'Mountain fold back down to a right angle.',
    }
  }),
}

const dog = {
  id: 'dog',
  name: 'Dog face',
  sheet: [DIAMOND],
  folds: [
    { from: [-1, 0], to: [1, 0], angle: 180, text: 'Fold the top corner down to the bottom one.' },
    { from: [0.28, 0], to: [0.5, -0.2], angle: 150, text: 'Fold the right ear down, not quite flat.' },
    { from: [-0.5, -0.2], to: [-0.28, 0], angle: 150, text: 'And the left ear.' },
    { from: [1, -0.55], to: [-1, -0.55], angle: -180, text: 'Mountain fold the chin behind.' },
  ],
}

const S = 0.36
const cell = (column, row) => {
  const x = (column - 0.5) * S
  const y = (row - 1) * S
  return [[x, y], [x + S, y], [x + S, y + S], [x, y + S]]
}
const cube = {
  id: 'cube',
  name: 'Cube',
  sheet: [cell(0, 0), cell(-1, 0), cell(1, 0), cell(0, -1), cell(0, 1), cell(0, 2)],
  folds: [
    { from: [-1, S], to: [1, S], angle: 90, text: 'Stand the lid up.' },
    { from: [-1, 0], to: [1, 0], angle: 90, text: 'Raise the back wall; the lid closes over.' },
    { from: [1, -S], to: [-1, -S], angle: 90, text: 'Raise the front wall.' },
    { from: [-S / 2, -1], to: [-S / 2, 1], angle: 90, text: 'Raise the left wall.' },
    { from: [S / 2, 1], to: [S / 2, -1], angle: 90, text: 'Raise the right wall.' },
  ],
}

export const models = [book, stand, stairs, dog, cube]
