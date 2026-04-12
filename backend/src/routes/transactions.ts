import express from 'express'
import { body, validationResult } from 'express-validator'
import { transactionController } from '../controllers/transactionController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Create transaction
router.post('/create', [
  body('recipientAddress').isLength({ min: 56, max: 56 }).withMessage('Invalid Stellar address'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0.01'),
  body('currency').isIn(['USDC', 'USDT']).withMessage('Invalid currency'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message too long'),
], authenticateToken, transactionController.createTransaction)

// Get transaction by ID
router.get('/:id', authenticateToken, transactionController.getTransaction)

// Get user transactions
router.get('/user/:userId', authenticateToken, transactionController.getUserTransactions)

// Execute transaction
router.post('/:id/execute', [
  body('signature').notEmpty().withMessage('Signature is required'),
], authenticateToken, transactionController.executeTransaction)

// Refund transaction
router.post('/:id/refund', [
  body('signature').notEmpty().withMessage('Signature is required'),
], authenticateToken, transactionController.refundTransaction)

export default router
