export const MIN_ZOOM = 0.3
export const MAX_ZOOM = 2.5
const WHEEL_RATE = 0.01

export const clampZoom = value => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))

export const wheelZoom = (scale, deltaY) => clampZoom(scale * Math.exp(-deltaY * WHEEL_RATE))

export const refocus = ({ scale, next, focus, scroll }) => {
  const k = next / scale
  return [(scroll[0] + focus[0]) * k - focus[0], (scroll[1] + focus[1]) * k - focus[1]]
}

const spread = touches => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
const middle = touches => [(touches[0].clientX + touches[1].clientX) / 2, (touches[0].clientY + touches[1].clientY) / 2]

export const enableZoom = (pad, world) => {
  let scale = 1

  const zoomAt = (value, x, y) => {
    const next = clampZoom(value)
    if (next === scale) return
    const box = pad.getBoundingClientRect()
    const focus = [x - box.left, y - box.top]
    const [left, top] = refocus({ scale, next, focus, scroll: [pad.scrollLeft, pad.scrollTop] })
    scale = next
    world.style.zoom = scale
    world.style.setProperty('--zoom', scale)
    pad.scrollLeft = left
    pad.scrollTop = top
  }

  pad.addEventListener(
    'wheel',
    event => {
      if (!event.ctrlKey) return
      event.preventDefault()
      zoomAt(wheelZoom(scale, event.deltaY), event.clientX, event.clientY)
    },
    { passive: false },
  )

  if ('GestureEvent' in window) {
    let start = 1
    pad.addEventListener('gesturestart', event => {
      event.preventDefault()
      start = scale
    })
    pad.addEventListener('gesturechange', event => {
      event.preventDefault()
      zoomAt(start * event.scale, event.clientX, event.clientY)
    })
    return
  }

  let pinch = null
  pad.addEventListener('touchstart', event => {
    if (event.touches.length === 2) pinch = { distance: spread(event.touches), scale }
  })
  pad.addEventListener(
    'touchmove',
    event => {
      if (!pinch || event.touches.length !== 2) return
      event.preventDefault()
      const [x, y] = middle(event.touches)
      zoomAt((pinch.scale * spread(event.touches)) / pinch.distance, x, y)
    },
    { passive: false },
  )
  pad.addEventListener('touchend', event => {
    if (event.touches.length < 2) pinch = null
  })
}
