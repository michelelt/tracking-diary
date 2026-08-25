export type EntryData = {
  id: string
  userId: string
  date: string
  sleep?: SleepData
  energy?: EnergyData
  mood?: string
  movement?: MovementData
  stimulation?: string
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
  types?: string[]
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
