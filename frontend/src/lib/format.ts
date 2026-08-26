export const prettyId = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

export function flattenSolution(item: Record<string, unknown>): string {
  const entries = Object.entries(item)
  if (!entries.length) return 'Sin datos'
  return entries.map(([key, value]) => `${prettyId(key)}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')
}

export function suspectId(item: Record<string, unknown>): string {
  const possible = ['Sospechoso', 'Id', 'S', 'SospechosoA']
  for (const key of possible) if (typeof item[key] === 'string') return item[key] as string
  return String(Object.values(item)[0] ?? '')
}
