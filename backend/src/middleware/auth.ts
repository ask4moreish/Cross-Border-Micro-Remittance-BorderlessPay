import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/auth'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    publicKey: string
    isKycVerified: boolean
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' })
    return
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ success: false, error: 'Invalid token' })
    return
  }

  req.user = {
    id: decoded.userId,
    publicKey: 'mock-public-key',
    isKycVerified: false,
  }

  next()
}
