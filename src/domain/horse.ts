export interface Horse {
  id: string
  name: string
  color: string
  condition: number
}

const HORSE_COLORS = [
  '#DC2626',
  '#EA580C',
  '#D97706',
  '#CA8A04',
  '#65A30D',
  '#16A34A',
  '#059669',
  '#0D9488',
  '#0891B2',
  '#0284C7',
  '#2563EB',
  '#4F46E5',
  '#7C3AED',
  '#9333EA',
  '#C026D3',
  '#DB2777',
  '#E11D48',
  '#92400E',
  '#475569',
  '#18181B',
] as const

/** The random source must return a value in [0, 1), like Math.random. */
export function generateHorses(random: () => number = Math.random): Horse[] {
  return HORSE_COLORS.map((color, index) => {
    const number = String(index + 1).padStart(2, '0')

    return {
      id: `horse-${number}`,
      name: `Horse ${number}`,
      color,
      condition: Math.floor(random() * 100) + 1,
    }
  })
}
