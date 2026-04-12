import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/auth'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    publicKey: string
    isKycVerified: boolean
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    })
  }

  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      })
    }

    // In a real implementation, you would fetch user from database
    req.user = {
      id: decoded.userId,
      publicKey: 'mock-public-key', // Would fetch from database
      isKycVerified: false, // Would fetch from database
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    })
  }
}
