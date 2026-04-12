import express from 'express'
import { body, validationResult } from 'express-validator'
import { userController } from '../controllers/userController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Get user profile
router.get('/profile', authenticateToken, userController.getProfile)

// Update user profile
router.put('/profile', [
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
], authenticateToken, userController.updateProfile)

// Get user balance
router.get('/balance', authenticateToken, userController.getBalance)

// Get user statistics
router.get('/stats', authenticateToken, userController.getStats)

export default router
