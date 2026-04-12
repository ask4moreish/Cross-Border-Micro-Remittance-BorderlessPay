import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma } from '../index'
import { stellarService } from '../services/stellarService'
import { logger } from '../utils/logger'

export const transactionController = {
  createTransaction: async (req: Request, res: Response) => {
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
      const { recipientAddress, amount, currency, message } = req.body

      // Calculate fees
      const feeRate = 0.003 // 0.3%
      const fee = amount * feeRate
      const totalAmount = amount + fee

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          recipientAddress,
          amount,
          currency,
          fee,
          message,
          status: 'PENDING',
          type: 'SENT',
          totalAmount,
        },
      })

      // Create Stellar transaction
      const stellarTx = await stellarService.createTransaction({
        from: req.user?.publicKey,
        to: recipientAddress,
        amount,
        currency,
        fee,
        transactionId: transaction.id,
        message,
      })

      // Update transaction with Stellar details
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          stellarTransactionId: stellarTx.id,
          stellarTransactionXdr: stellarTx.xdr,
        },
      })

      logger.info(`Transaction created: ${transaction.id} for user: ${userId}`)

      res.json({
        success: true,
        data: {
          transaction: {
            id: transaction.id,
            recipientAddress,
            amount,
            currency,
            fee,
            totalAmount,
            message,
            status: transaction.status,
            stellarTransactionId: stellarTx.id,
            createdAt: transaction.createdAt,
          },
          stellarTx,
        },
      })
    } catch (error) {
      logger.error('Error in createTransaction:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  getTransaction: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user?.id

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        })
      }

      res.json({
        success: true,
        data: { transaction },
      })
    } catch (error) {
      logger.error('Error in getTransaction:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  getUserTransactions: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      const { page = 1, limit = 20, type, status } = req.query

      const where: any = { userId }
      if (type) where.type = type
      if (status) where.status = status

      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      })

      const total = await prisma.transaction.count({ where })

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      })
    } catch (error) {
      logger.error('Error in getUserTransactions:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  executeTransaction: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { signature } = req.body
      const userId = req.user?.id

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId,
          status: 'PENDING',
        },
      })

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found or already processed',
        })
      }

      // Execute Stellar transaction
      const result = await stellarService.executeTransaction(
        transaction.stellarTransactionXdr!,
        signature
      )

      // Update transaction status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          completedAt: new Date(),
          stellarResult: result,
        },
      })

      logger.info(`Transaction executed: ${transaction.id} with status: ${updatedTransaction.status}`)

      res.json({
        success: true,
        data: {
          transaction: updatedTransaction,
          stellarResult: result,
        },
      })
    } catch (error) {
      logger.error('Error in executeTransaction:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  refundTransaction: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { signature } = req.body
      const userId = req.user?.id

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId,
          status: 'PENDING',
        },
      })

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found or already processed',
        })
      }

      // Refund Stellar transaction
      const result = await stellarService.refundTransaction(
        transaction.stellarTransactionXdr!,
        signature
      )

      // Update transaction status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: result.success ? 'REFUNDED' : 'FAILED',
          completedAt: new Date(),
          stellarResult: result,
        },
      })

      logger.info(`Transaction refunded: ${transaction.id}`)

      res.json({
        success: true,
        data: {
          transaction: updatedTransaction,
          stellarResult: result,
        },
      })
    } catch (error) {
      logger.error('Error in refundTransaction:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
}
