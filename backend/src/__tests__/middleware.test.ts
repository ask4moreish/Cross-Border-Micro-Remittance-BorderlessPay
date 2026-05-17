import { Request, Response, NextFunction } from 'express'
import { authenticateToken } from '../middleware/auth'
import { generateTokens } from '../utils/auth'

const mockRes = () => {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res as Response
}

describe('authenticateToken middleware', () => {
  it('returns 401 when no token provided', () => {
    const req = { headers: {} } as Request
    const res = mockRes()
    const next = jest.fn() as NextFunction

    authenticateToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad-token' } } as Request
    const res = mockRes()
    const next = jest.fn() as NextFunction

    authenticateToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next() for valid token', () => {
    const { accessToken } = generateTokens('user-123')
    const req = { headers: { authorization: `Bearer ${accessToken}` } } as Request
    const res = mockRes()
    const next = jest.fn() as NextFunction

    authenticateToken(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
