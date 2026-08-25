export const SLEEP_FEELINGS = {
  male: { label: 'Male', emoji: '😞' },
  così_così: { label: 'Così così', emoji: '😐' },
  bene: { label: 'Bene', emoji: '🙂' },
  benissimo: { label: 'Benissimo', emoji: '😄' },
}

export const MOODS = {
  basso: { label: 'Basso', emoji: '😔', color: 'bg-red-400' },
  neutro: { label: 'Neutro', emoji: '😐', color: 'bg-slate-400' },
  buono: { label: 'Buono', emoji: '🙂', color: 'bg-green-400' },
  molto_buono: { label: 'Molto buono', emoji: '😄', color: 'bg-green-600' },
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

export const ADMIN_SESSION_DURATION = 2 * 60 * 60 * 1000 // 2 hours in ms
