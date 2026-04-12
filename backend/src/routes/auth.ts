import express from 'express'
import { body, validationResult } from 'express-validator'
import { authController } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Register/Connect wallet
router.post('/connect', [
  body('publicKey').isLength({ min: 56, max: 56 }).withMessage('Invalid Stellar public key'),
  body('signature').notEmpty().withMessage('Signature is required'),
], authController.connectWallet)

// Refresh token
router.post('/refresh', authController.refreshToken)

// Verify KYC
router.post('/verify-kyc', [
  body('documentType').isIn(['passport', 'id', 'license']).withMessage('Invalid document type'),
  body('documentNumber').notEmpty().withMessage('Document number is required'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('address').notEmpty().withMessage('Address is required'),
], authenticateToken, authController.verifyKYC)

// Logout
router.post('/logout', authenticateToken, authController.logout)

export default router
