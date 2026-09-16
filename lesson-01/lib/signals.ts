export type Shape = 'sine' | 'square' | 'saw' | 'triangle'

export function sample(shape: Shape, phase: number): number {
  const p = ((phase % 1) + 1) % 1
  if (shape === 'square') return p < 0.5 ? -1 : 1
  if (shape === 'saw') return 2 * p - 1
  if (shape === 'triangle') return 1 - 4 * Math.abs(p - 0.5)
  return Math.sin(2 * Math.PI * p)
}

export function periodSamples(shape: Shape, n: number, amplitude = 1): number[] {
  return Array.from({ length: n }, (_, i) => amplitude * sample(shape, i / n))
}
