import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma } from '../index'
import { generateTokens, verifySignature } from '../utils/auth'
import { logger } from '../utils/logger'

export const authController = {
  connectWallet: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        })
      }

      const { publicKey, signature } = req.body

      // Verify signature (mock implementation)
      const isValidSignature = await verifySignature(publicKey, signature)
      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature',
        })
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { publicKey },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            publicKey,
            isKycVerified: false,
          },
        })
        logger.info(`New user created: ${publicKey}`)
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id)

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            publicKey: user.publicKey,
            isKycVerified: user.isKycVerified,
            email: user.email,
            name: user.name,
          },
          accessToken,
          refreshToken,
        },
      })
    } catch (error) {
      logger.error('Error in connectWallet:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required',
        })
      }

      // Verify refresh token and get user
      const user = await verifySignature(refreshToken, 'refresh')
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        })
      }

      // Generate new tokens
      const tokens = generateTokens(user.id)

      res.json({
        success: true,
        data: tokens,
      })
    } catch (error) {
      logger.error('Error in refreshToken:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  verifyKYC: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        })
      }

      const userId = req.user?.id
      const { documentType, documentNumber, fullName, dateOfBirth, address } = req.body

      // Update user with KYC information
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: fullName,
          email: req.body.email,
          isKycVerified: true,
          kycVerifiedAt: new Date(),
          kycData: {
            documentType,
            documentNumber,
            dateOfBirth,
            address,
            verifiedAt: new Date().toISOString(),
          },
        },
      })

      logger.info(`KYC verified for user: ${user.publicKey}`)

      res.json({
        success: true,
        data: {
          isKycVerified: true,
          message: 'KYC verification completed successfully',
        },
      })
    } catch (error) {
      logger.error('Error in verifyKYC:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      // In a real implementation, you would invalidate the token
      // For now, just return success
      res.json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      logger.error('Error in logout:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
}
