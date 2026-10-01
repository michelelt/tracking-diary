// Entry dates are stored at UTC midnight and travel as YYYY-MM-DD strings

export const toDateString = (date: Date) => date.toISOString().split('T')[0]

export const fromDateString = (date: string) => new Date(date + 'T00:00:00Z')

export const addDays = (date: string, days: number) =>
  toDateString(new Date(fromDateString(date).getTime() + days * 86400000))

// YYYY-MM-DD in the browser's timezone: "today" for the user, not for UTC
export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
