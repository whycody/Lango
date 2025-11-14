export const getLevelColor = (level: number): string => {
  const startColor = { r: 255, g: 50, b: 50 };
  const middleColor = { r: 255, g: 255, b: 100 };
  const endColor = { r: 100, g: 255, b: 100 };

  const interpolate = (c1: number, c2: number, t: number) => Math.round(c1 + (c2 - c1) * t);

  let r: number, g: number, b: number;

  if (level < 0.5) {
    const t = level * 2;
    r = interpolate(startColor.r, middleColor.r, t);
    g = interpolate(startColor.g, middleColor.g, t);
    b = interpolate(startColor.b, middleColor.b, t);
  } else {
    const t = (level - 0.5) * 2;
    r = interpolate(middleColor.r, endColor.r, t);
    g = interpolate(middleColor.g, endColor.g, t);
    b = interpolate(middleColor.b, endColor.b, t);
  }

  return `rgb(${r},${g},${b})`;
};
