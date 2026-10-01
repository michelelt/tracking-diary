process.env.GOOGLE_CLIENT_ID = 'id'
process.env.GOOGLE_CLIENT_SECRET = 'secret'
process.env.ADMIN_EMAIL = 'admin@example.com'

jest.mock('next-auth/providers/google', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('@/lib/db', () => ({ db: { allowedUser: { findUnique: jest.fn() } } }))

import { isAdminEmail, isAllowedEmail } from '@/lib/auth'
import { db } from '@/lib/db'

const findUnique = db.allowedUser.findUnique as jest.Mock

describe('allowlist', () => {
  it('treats only ADMIN_EMAIL as admin', () => {
    expect(isAdminEmail('admin@example.com')).toBe(true)
    expect(isAdminEmail('other@example.com')).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
  })

  it('lets in the admin and approved users only', async () => {
    expect(await isAllowedEmail('admin@example.com')).toBe(true)

    findUnique.mockResolvedValue(null)
    expect(await isAllowedEmail('stranger@example.com')).toBe(false)

    findUnique.mockResolvedValue({ approved: false })
    expect(await isAllowedEmail('pending@example.com')).toBe(false)

    findUnique.mockResolvedValue({ approved: true })
    expect(await isAllowedEmail('friend@example.com')).toBe(true)
  })
})
