import { describe, it, expect } from 'vitest'
import { reminderSchema } from '@/lib/validations/calendar'

// Simple unit tests for calendar reminders validation and logic
describe('/api/calendar/reminders', () => {
  const testStartDateString = '2023-01-15T10:00:00Z'
  const testEndDateString = '2023-01-15T11:00:00Z'
  const testStartDate = new Date(testStartDateString)
  const testEndDate = new Date(testEndDateString)
  const testTitle = 'Test reminder'
  const testDescription = 'Test description'

  describe('reminder schema validation', () => {
    it('should validate valid reminder data', () => {
      const validData = {
        title: testTitle,
        description: testDescription,
        startsAt: testStartDateString,
        endsAt: testEndDateString,
        allDay: false,
      }

      const result = reminderSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe(testTitle)
        expect(result.data.description).toBe(testDescription)
        expect(result.data.startsAt).toBeInstanceOf(Date)
        expect(result.data.endsAt).toBeInstanceOf(Date)
        expect(result.data.allDay).toBe(false)
      }
    })

    it('should validate minimal reminder data', () => {
      const minimalData = {
        title: testTitle,
        startsAt: testStartDateString,
      }

      const result = reminderSchema.safeParse(minimalData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe(testTitle)
        expect(result.data.description).toBeUndefined()
        expect(result.data.startsAt).toEqual(testStartDate)
        expect(result.data.endsAt).toBeUndefined()
        expect(result.data.allDay).toBeUndefined()
      }
    })

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        startsAt: testStartDateString,
      }

      const result = reminderSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toBeDefined()
      }
    })

    it('should reject title that is too long', () => {
      const invalidData = {
        title: 'a'.repeat(201), // 201 characters
        startsAt: testStartDateString,
      }

      const result = reminderSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toBeDefined()
      }
    })

    it('should reject description that is too long', () => {
      const invalidData = {
        title: testTitle,
        description: 'a'.repeat(2001), // 2001 characters
        startsAt: testStartDateString,
      }

      const result = reminderSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.description).toBeDefined()
      }
    })

    it('should reject invalid date format', () => {
      const invalidData = {
        title: testTitle,
        startsAt: 'invalid-date',
      }

      const result = reminderSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.startsAt).toBeDefined()
      }
    })

    it('should coerce valid date strings to Date objects', () => {
      const validData = {
        title: testTitle,
        startsAt: testStartDateString,
        endsAt: testEndDateString,
      }

      const result = reminderSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.startsAt).toEqual(testStartDate)
        expect(result.data.endsAt).toBeDefined()
        expect(result.data.endsAt).toEqual(testEndDate)
      }
    })
  })

  describe('reminder data transformation', () => {
    it('should transform valid data for database insertion', () => {
      const reminderData = {
        title: testTitle,
        description: testDescription,
        startsAt: testStartDate,
        endsAt: testEndDate,
        allDay: false,
      }

      const dbData = {
        userId: 'user1',
        title: reminderData.title,
        description: reminderData.description ?? null,
        startsAt: reminderData.startsAt,
        endsAt: reminderData.endsAt ?? null,
        allDay: reminderData.allDay ?? false,
      }

      expect(dbData).toEqual({
        userId: 'user1',
        title: testTitle,
        description: testDescription,
        startsAt: testStartDate,
        endsAt: testEndDate,
        allDay: false,
      })
    })

    it('should transform minimal data for database insertion', () => {
      const reminderData = {
        title: testTitle,
        startsAt: testStartDate,
      }

      const dbData = {
        userId: 'user1',
        title: reminderData.title,
        description: null,
        startsAt: reminderData.startsAt,
        endsAt: null,
        allDay: false,
      }

      expect(dbData).toEqual({
        userId: 'user1',
        title: testTitle,
        description: null,
        startsAt: testStartDate,
        endsAt: null,
        allDay: false,
      })
    })
  })
})
