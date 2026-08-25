import { z } from 'zod'

export const SleepSchema = z.object({
  bedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  fallAsleepTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  wakeUpTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  feeling: z.enum(['male', 'così_così', 'bene', 'benissimo']).optional(),
  hoursSlept: z.number().min(0).max(24).optional(),
})

export const EnergySchema = z.object({
  morning: z.number().int().min(1).max(10).optional(),
  afternoon: z.number().int().min(1).max(10).optional(),
  evening: z.number().int().min(1).max(10).optional(),
})

export const MoodSchema = z.enum(['basso', 'neutro', 'buono', 'molto_buono']).optional()

export const MovementSchema = z.object({
  types: z.array(z.enum(['palestra', 'nuoto', 'altro', 'niente'])).optional(),
  notes: z.string().max(100).optional(),
})

export const StimulationSchema = z.enum(['poco', 'normale', 'tanto', 'troppo']).optional()

export const EntrySchema = z.object({
  date: z.string().date(),
  sleep: SleepSchema.nullable().optional(),
  energy: EnergySchema.nullable().optional(),
  mood: MoodSchema.nullable(),
  movement: MovementSchema.nullable().optional(),
  stimulation: StimulationSchema.nullable(),
  positiveThing: z.string().max(200).nullable().optional(),
})

export type Entry = z.infer<typeof EntrySchema>
export type Sleep = z.infer<typeof SleepSchema>
export type Energy = z.infer<typeof EnergySchema>
export type Movement = z.infer<typeof MovementSchema>
