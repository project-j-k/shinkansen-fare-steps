export const svg = (width: number, height: number, body: string, label: string): string => `
  <div class="chart-scroll" role="img" aria-label="${label}">
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <title>${label}</title>
      ${body}
    </svg>
  </div>`;

export const line = (points: [number, number][], className: string): string =>
  `<polyline class="${className}" points="${points.map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" />`;

export const axisLabel = (x: number, y: number, text: string, anchor = "middle"): string =>
  `<text class="axis-label" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;

export const handPath = (points: [number, number][], seed: string): string => {
  const wobble = (index: number): number => {
    const code = seed.charCodeAt(index % seed.length) + index * 17;
    return ((code % 7) - 3) * 0.7;
  };
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${(x + wobble(index)).toFixed(1)} ${(y + wobble(index + 3)).toFixed(1)}`)
    .join(" ");
};
