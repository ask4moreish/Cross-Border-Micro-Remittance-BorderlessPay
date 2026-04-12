import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { stellarService } from '../services/stellarService'
import { logger } from '../utils/logger'

export const stellarController = {
  getAccountBalance: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        })
      }

      const { publicKey } = req.params

      // Validate address format
      if (!stellarService.validateAddress(publicKey)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Stellar address',
        })
      }

      const balances = await stellarService.getAccountBalance(publicKey)

      res.json({
        success: true,
        data: { balances },
      })
    } catch (error) {
      logger.error('Error in getAccountBalance:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  getTransactionStatus: async (req: Request, res: Response) => {
    try {
      const { hash } = req.params

      const status = await stellarService.getTransactionStatus(hash)

      res.json({
        success: true,
        data: { status },
      })
    } catch (error) {
      logger.error('Error in getTransactionStatus:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  validateAddress: async (req: Request, res: Response) => {
    try {
      const { address } = req.body

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'Address is required',
        })
      }

      const isValid = stellarService.validateAddress(address)

      res.json({
        success: true,
        data: { isValid },
      })
    } catch (error) {
      logger.error('Error in validateAddress:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },

  getExchangeRates: async (req: Request, res: Response) => {
    try {
      // Mock exchange rates - in real app, fetch from external API
      const exchangeRates = {
        USDC: {
          USD: 1.00,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.50,
        },
        USDT: {
          USD: 1.00,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.50,
        },
        lastUpdated: new Date().toISOString(),
      }

      res.json({
        success: true,
        data: { exchangeRates },
      })
    } catch (error) {
      logger.error('Error in getExchangeRates:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
}
