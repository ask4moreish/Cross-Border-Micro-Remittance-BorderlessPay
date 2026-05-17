import { generateTokens, verifyToken, verifyRefreshToken, hashPassword, comparePassword, verifySignature } from '../utils/auth'

describe('auth utils', () => {
  describe('generateTokens / verifyToken / verifyRefreshToken', () => {
    it('generates valid access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokens('user-123')
      expect(accessToken).toBeTruthy()
      expect(refreshToken).toBeTruthy()
    })

    it('verifyToken returns userId for valid token', () => {
      const { accessToken } = generateTokens('user-abc')
      const decoded = verifyToken(accessToken)
      expect(decoded?.userId).toBe('user-abc')
    })

    it('verifyToken returns null for invalid token', () => {
      expect(verifyToken('bad-token')).toBeNull()
    })

    it('verifyRefreshToken returns userId for valid refresh token', () => {
      const { refreshToken } = generateTokens('user-xyz')
      const decoded = verifyRefreshToken(refreshToken)
      expect(decoded?.userId).toBe('user-xyz')
    })

    it('verifyRefreshToken returns null for invalid token', () => {
      expect(verifyRefreshToken('bad-token')).toBeNull()
    })

    it('access token is not valid as refresh token', () => {
      const { accessToken } = generateTokens('user-123')
      expect(verifyRefreshToken(accessToken)).toBeNull()
    })
  })

  describe('hashPassword / comparePassword', () => {
    it('hashes and compares password correctly', async () => {
      const hash = await hashPassword('mypassword')
      expect(hash).not.toBe('mypassword')
      expect(await comparePassword('mypassword', hash)).toBe(true)
      expect(await comparePassword('wrongpassword', hash)).toBe(false)
    })
  })

  describe('verifySignature', () => {
    it('returns true (mock implementation)', async () => {
      expect(await verifySignature('pubkey', 'sig')).toBe(true)
    })
  })
})
