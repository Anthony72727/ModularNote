import { describe, expect, it } from 'vitest'
import { computeCanvasHitbox, findHitboxExit } from './canvasHitbox'

describe('computeCanvasHitbox', () => {
  it('is nothing when no note is dragged', () => {
    expect(computeCanvasHitbox([])).toBeNull()
  })

  it('is the circle of the note when only one is dragged', () => {
    expect(computeCanvasHitbox([{ x: 10, y: 20, radius: 100 }])).toEqual({
      left: 10,
      top: 20,
      right: 10,
      bottom: 20,
      radius: 100,
    })
  })

  it('holds the centers of every dragged note, widened by the largest radius', () => {
    const hitbox = computeCanvasHitbox([
      { x: 0, y: 50, radius: 100 },
      { x: 400, y: 0, radius: 120 },
      { x: 200, y: 300, radius: 90 },
    ])

    expect(hitbox).toEqual({ left: 0, top: 0, right: 400, bottom: 300, radius: 120 })
  })
})

describe('findHitboxExit', () => {
  const hitbox = { left: 0, top: 0, right: 400, bottom: 0, radius: 100 }

  it('is nothing for a circle that does not touch the hitbox', () => {
    expect(findHitboxExit({ x: 200, y: 151, radius: 50 }, hitbox)).toBeNull()
  })

  it('pushes a circle straight out of a side', () => {
    expect(findHitboxExit({ x: 200, y: 100, radius: 50 }, hitbox)).toEqual({ x: 200, y: 150 })
  })

  it('pushes a circle out of a round corner, away from it', () => {
    const exit = findHitboxExit({ x: 430, y: 40, radius: 50 }, hitbox)

    expect(exit?.x).toBeCloseTo(400 + 150 * 0.6)
    expect(exit?.y).toBeCloseTo(150 * 0.8)
  })

  it('takes the closest side for a circle whose center is between the dragged notes', () => {
    const tallHitbox = { left: 0, top: 0, right: 400, bottom: 300, radius: 100 }

    expect(findHitboxExit({ x: 60, y: 150, radius: 50 }, tallHitbox)).toEqual({ x: -150, y: 150 })
  })
})
