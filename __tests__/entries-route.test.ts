/** @jest-environment node */

jest.mock('@/lib/api-helpers', () => ({ requireAuthUser: jest.fn() }))
jest.mock('@/lib/db', () => ({
  db: { entry: { findUnique: jest.fn(), count: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() } },
}))

import { DELETE, POST } from '@/app/api/entries/route'
import { requireAuthUser } from '@/lib/api-helpers'
import { toDateString } from '@/lib/dates'
import { db } from '@/lib/db'
import { DEMO_LIMIT_ERROR, DEMO_READONLY_ERROR } from '@/lib/demo'
import { NextRequest } from 'next/server'

const entry = db.entry as unknown as Record<'findUnique' | 'count' | 'upsert' | 'deleteMany', jest.Mock>
const today = toDateString(new Date())

const signInAs = (email: string) =>
  (requireAuthUser as jest.Mock).mockResolvedValue({ user: { id: 'u1', email }, error: null })

const request = (method: string, body: object) =>
  new NextRequest('http://localhost/api/entries', { method, body: JSON.stringify(body) })

beforeEach(() => {
  jest.resetAllMocks()
  entry.upsert.mockResolvedValue({ id: 'new', date: new Date(today) })
})

describe('demo user on /api/entries', () => {
  beforeEach(() => signInAs('demo@demo.it'))

  it('cannot edit the seeded history', async () => {
    entry.findUnique.mockResolvedValue({ id: `demo-seed-${today}` })
    entry.count.mockResolvedValue(0)

    const res = await POST(request('POST', { date: today, mood: 'buono' }))

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: DEMO_READONLY_ERROR, demo: true })
    expect(entry.upsert).not.toHaveBeenCalled()
  })

  it('cannot delete the seeded history', async () => {
    entry.findUnique.mockResolvedValue({ id: `demo-seed-${today}` })

    const res = await DELETE(request('DELETE', { date: today }))

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: DEMO_READONLY_ERROR, demo: true })
    expect(entry.deleteMany).not.toHaveBeenCalled()
  })

  it('creates new entries only up to the limit', async () => {
    entry.findUnique.mockResolvedValue(null)

    entry.count.mockResolvedValue(1)
    expect((await POST(request('POST', { date: today, mood: 'buono' }))).status).toBe(200)
    expect(entry.upsert).toHaveBeenCalledTimes(1)

    entry.count.mockResolvedValue(2)
    const res = await POST(request('POST', { date: today, mood: 'buono' }))
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: DEMO_LIMIT_ERROR, demo: true })
    expect(entry.upsert).toHaveBeenCalledTimes(1)
  })

  it('can edit and delete a visitor entry even at the limit', async () => {
    entry.findUnique.mockResolvedValue({ id: 'cm1visitorentry0000' })
    entry.count.mockResolvedValue(2)

    expect((await POST(request('POST', { date: today, mood: 'basso' }))).status).toBe(200)
    expect((await DELETE(request('DELETE', { date: today }))).status).toBe(200)
    expect(entry.upsert).toHaveBeenCalledTimes(1)
    expect(entry.deleteMany).toHaveBeenCalledTimes(1)
  })
})

describe('regular user on /api/entries', () => {
  it('is not subject to the demo rules', async () => {
    signInAs('friend@example.com')

    expect((await POST(request('POST', { date: '2020-01-01', mood: 'buono' }))).status).toBe(200)
    expect((await DELETE(request('DELETE', { date: '2020-01-01' }))).status).toBe(200)
    expect(entry.findUnique).not.toHaveBeenCalled()
    expect(entry.count).not.toHaveBeenCalled()
  })
})
