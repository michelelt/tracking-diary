// Calculate hours slept from bed time and wake up time
export function calculateHoursSlept(bedTime: string, wakeUpTime: string): number {
  const [bedHour, bedMin] = bedTime.split(':').map(Number)
  const [wakeHour, wakeMin] = wakeUpTime.split(':').map(Number)

  let bedMinutes = bedHour * 60 + bedMin
  let wakeMinutes = wakeHour * 60 + wakeMin

  // If wake up time is before bed time, assume it's the next day
  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60
  }

  const hours = (wakeMinutes - bedMinutes) / 60
  return Math.round(hours * 4) / 4 // Round to nearest 0.25
}
