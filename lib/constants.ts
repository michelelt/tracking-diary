import { Armchair, Dumbbell, Footprints, Frown, Laugh, Meh, Smile, Waves } from 'lucide-react'

export const SLEEP_FEELINGS = {
  male: { label: 'Male', icon: Frown },
  così_così: { label: 'Così così', icon: Meh },
  bene: { label: 'Bene', icon: Smile },
  benissimo: { label: 'Benissimo', icon: Laugh },
}

export const MOODS = {
  // Same tokens as MOOD_COLORS in lib/dashboard.ts
  basso: { label: 'Basso', icon: Frown, color: 'bg-mood-basso text-mood-basso-fg' },
  neutro: { label: 'Neutro', icon: Meh, color: 'bg-mood-neutro text-mood-neutro-fg' },
  buono: { label: 'Buono', icon: Smile, color: 'bg-mood-buono text-mood-buono-fg' },
  molto_buono: { label: 'Molto buono', icon: Laugh, color: 'bg-mood-molto text-mood-molto-fg' },
}

export const MOVEMENT_TYPES = [
  { id: 'palestra', label: 'Palestra', icon: Dumbbell },
  { id: 'nuoto', label: 'Nuoto', icon: Waves },
  { id: 'altro', label: 'Altro', icon: Footprints },
  { id: 'niente', label: 'Niente', icon: Armchair },
]

export const STIMULATION_LEVELS = {
  poco: { label: 'Poco' },
  normale: { label: 'Normale' },
  tanto: { label: 'Tanto' },
  troppo: { label: 'Troppo' },
}
