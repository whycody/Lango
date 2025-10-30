export const calculateWeightedColor = (
  grades: number[],
  colors: { red300: string; yellow300: string; green300: string }
) => {
  if (!grades.length) return colors.green300

  const weights = { red: 0, yellow: 0, green: 0 }

  for (const grade of grades) {
    if (grade === 1) weights.red++
    else if (grade === 2) weights.yellow++
    else if (grade === 3) weights.green++
  }

  const total = weights.red + weights.yellow + weights.green
  if (total === 0) return colors.green300

  const parseRgba = (rgba: string) =>
    rgba.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0, 0, 0, 1]

  const red = parseRgba(colors.red300)
  const yellow = parseRgba(colors.yellow300)
  const green = parseRgba(colors.green300)

  const r =
    (red[0] * weights.red +
      yellow[0] * weights.yellow +
      green[0] * weights.green) /
    total
  const g =
    (red[1] * weights.red +
      yellow[1] * weights.yellow +
      green[1] * weights.green) /
    total
  const b =
    (red[2] * weights.red +
      yellow[2] * weights.yellow +
      green[2] * weights.green) /
    total

  return `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, 1)`
}
