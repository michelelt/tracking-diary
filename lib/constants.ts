export const SLEEP_FEELINGS = {
  male: { label: 'Male', emoji: '😞' },
  così_così: { label: 'Così così', emoji: '😐' },
  bene: { label: 'Bene', emoji: '🙂' },
  benissimo: { label: 'Benissimo', emoji: '😄' },
}

export const MOODS = {
  // Same hues as MOOD_COLORS in lib/dashboard.ts
  basso: { label: 'Basso', emoji: '😔', color: 'bg-[#e34948]' },
  neutro: { label: 'Neutro', emoji: '😐', color: 'bg-[#c9c7bf]' },
  buono: { label: 'Buono', emoji: '🙂', color: 'bg-[#5598e7]' },
  molto_buono: { label: 'Molto buono', emoji: '😄', color: 'bg-[#184f95]' },
}

export const MOVEMENT_TYPES = [
  { id: 'palestra', label: 'Palestra', emoji: '💪' },
  { id: 'nuoto', label: 'Nuoto', emoji: '🏊' },
  { id: 'altro', label: 'Altro', emoji: '🏃' },
  { id: 'niente', label: 'Niente', emoji: '🛋️' },
]

export const STIMULATION_LEVELS = {
  poco: { label: 'Poco', emoji: '📵' },
  normale: { label: 'Normale', emoji: '📱' },
  tanto: { label: 'Tanto', emoji: '📱📱' },
  troppo: { label: 'Troppo', emoji: '😵' },
}
