export const query = (search, pathname, changes) => {
  const params = new URLSearchParams(search)
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) params.delete(key)
    else params.set(key, value)
  }
  return params.size ? `?${params}` : pathname
}

export const stepIn = (search, total) => {
  const step = Number(new URLSearchParams(search).get('step'))
  return Number.isInteger(step) && step >= 1 ? Math.min(step, total + 1) : 1
}
