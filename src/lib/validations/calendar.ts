import { z } from 'zod'

export const reminderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  allDay: z.boolean().optional(),
})

export type ReminderInput = z.infer<typeof reminderSchema>
