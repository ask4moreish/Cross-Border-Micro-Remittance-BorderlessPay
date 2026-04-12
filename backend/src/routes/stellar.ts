import express from 'express'
import { query, validationResult } from 'express-validator'
import { stellarController } from '../controllers/stellarController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Get account balance
router.get('/balance/:publicKey', [
  query('publicKey').isLength({ min: 56, max: 56 }).withMessage('Invalid Stellar public key'),
], stellarController.getAccountBalance)

// Get transaction status
router.get('/transaction/:hash', stellarController.getTransactionStatus)

// Validate address
router.post('/validate-address', stellarController.validateAddress)

// Get exchange rates
router.get('/exchange-rates', stellarController.getExchangeRates)

export default router
