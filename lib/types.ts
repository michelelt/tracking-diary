export type EntryData = {
  id: string
  userId: string
  date: string
  sleep?: SleepData
  energy?: EnergyData
  mood?: 'basso' | 'neutro' | 'buono' | 'molto_buono' | null
  movement?: MovementData
  stimulation?: 'poco' | 'normale' | 'tanto' | 'troppo' | null
  positiveThing?: string
  createdAt: Date
  updatedAt: Date
}

export type SleepData = {
  bedTime?: string
  fallAsleepTime?: string
  wakeUpTime?: string
  feeling?: 'male' | 'così_così' | 'bene' | 'benissimo'
  hoursSlept?: number
}

export type EnergyData = {
  morning?: number
  afternoon?: number
  evening?: number
}

export type MovementData = {
  types?: ('palestra' | 'nuoto' | 'altro' | 'niente')[]
  notes?: string
}

export type UserWithStats = {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: Date
  lastAccess?: Date
  entriesCount: number
}
