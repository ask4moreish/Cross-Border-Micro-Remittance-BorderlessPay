import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma } from '../index'
import { stellarService } from '../services/stellarService'
import { logger } from '../utils/logger'

export const userController = {
  getProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          publicKey: true,
          name: true,
          email: true,
          isKycVerified: true,
          kycVerifiedAt: true,
          createdAt: true,
          lastLoginAt: true,
        },
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }

      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      logger.error('Error in getProfile:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  updateProfile: async (req: Request, res: Response) => {
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
      const { name, email } = req.body

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
        select: {
          id: true,
          publicKey: true,
          name: true,
          email: true,
          isKycVerified: true,
        },
      })

      logger.info(`User profile updated: ${user.id}`)

      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      logger.error('Error in updateProfile:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  getBalance: async (req: Request, res: Response) => {
    try {
      const publicKey = req.user?.publicKey

      const balances = await stellarService.getAccountBalance(publicKey)

      res.json({
        success: true,
        data: { balances },
      })
    } catch (error) {
      logger.error('Error in getBalance:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id

      // Get transaction statistics
      const [
        totalSent,
        totalReceived,
        transactionCount,
        feesPaid,
      ] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: 'SENT', status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: 'RECEIVED', status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.transaction.count({
          where: { userId, status: 'COMPLETED' },
        }),
        prisma.transaction.aggregate({
          where: { userId, status: 'COMPLETED' },
          _sum: { fee: true },
        }),
      ])

      // Calculate fees saved compared to traditional remittance (7% average)
      const traditionalFees = (totalSent._sum.amount || 0) * 0.07
      const actualFees = feesPaid._sum.fee || 0
      const feesSaved = traditionalFees - actualFees

      const stats = {
        totalSent: totalSent._sum.amount || 0,
        totalReceived: totalReceived._sum.amount || 0,
        transactionCount,
        feesPaid: actualFees,
        feesSaved: Math.max(0, feesSaved),
      }

      res.json({
        success: true,
        data: { stats },
      })
    } catch (error) {
      logger.error('Error in getStats:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
}
