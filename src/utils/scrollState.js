export function horizontalScrollState({ scrollLeft = 0, clientWidth = 0, scrollWidth = 0 }) {
  const maximum = Math.max(0, scrollWidth - clientWidth)
  return {
    canScrollBack: scrollLeft > 1,
    canScrollForward: scrollLeft < maximum - 1,
  }
}
