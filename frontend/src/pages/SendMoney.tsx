import { useState } from 'react'
import { Send, QrCode, User, DollarSign, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const sendMoneySchema = z.object({
  recipientAddress: z.string().min(56, 'Invalid Stellar address'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a positive number'
  ),
  currency: z.enum(['USDC', 'USDT']),
  message: z.string().optional(),
})

type SendMoneyForm = z.infer<typeof sendMoneySchema>

export function SendMoney() {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SendMoneyForm>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      currency: 'USDC',
    },
  })

  const watchedAmount = watch('amount')
  const watchedCurrency = watch('currency')

  const calculateFee = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount) || 0
    const feeRate = 0.003 // 0.3% fee
    return (numAmount * feeRate).toFixed(4)
  }

  const onSubmit = async (data: SendMoneyForm) => {
    if (!user) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsSubmitting(true)
    try {
      // Mock transaction - in real app, this would interact with Stellar
      console.log('Sending transaction:', {
        from: user.publicKey,
        to: data.recipientAddress,
        amount: data.amount,
        currency: data.currency,
        message: data.message,
      })

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Transaction sent successfully!')
      
      // Reset form
      setValue('recipientAddress', '')
      setValue('amount', '')
      setValue('message', '')
    } catch (error) {
      console.error('Transaction failed:', error)
      toast.error('Transaction failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQRScan = (address: string) => {
    setValue('recipientAddress', address)
    setShowQRScanner(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Send Money</h1>
        <p className="text-muted-foreground">
          Send stablecoins to any Stellar wallet address worldwide
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="label mb-2 block">Recipient Address</label>
            <div className="flex space-x-2">
              <input
                {...register('recipientAddress')}
                type="text"
                placeholder="G..."
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => setShowQRScanner(!showQRScanner)}
                className="btn btn-outline"
              >
                <QrCode className="h-4 w-4" />
              </button>
            </div>
            {errors.recipientAddress && (
              <p className="text-sm text-destructive mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.recipientAddress.message}
              </p>
            )}
          </div>

          {/* Currency Selection */}
          <div>
            <label className="label mb-2 block">Currency</label>
            <select {...register('currency')} className="input">
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label mb-2 block">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                {...register('amount')}
                type="text"
                placeholder="0.00"
                className="input pl-10"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Fee Calculation */}
          {watchedAmount && parseFloat(watchedAmount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-accent/50 p-4 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Transaction Fee (0.3%)</span>
                <span className="font-medium">
                  {calculateFee(watchedAmount, watchedCurrency)} {watchedCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">
                  {(parseFloat(watchedAmount) + parseFloat(calculateFee(watchedAmount, watchedCurrency))).toFixed(4)} {watchedCurrency}
                </span>
              </div>
            </motion.div>
          )}

          {/* Message */}
          <div>
            <label className="label mb-2 block">Message (Optional)</label>
            <textarea
              {...register('message')}
              placeholder="Add a message to the recipient..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Money</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowQRScanner(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-background rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
            <div className="bg-muted rounded-lg p-8 text-center">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                QR code scanner would be implemented here
              </p>
              <button
                onClick={() => handleQRScan('GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890')}
                className="btn btn-outline"
              >
                Use Test Address
              </button>
            </div>
            <button
              onClick={() => setShowQRScanner(false)}
              className="btn btn-secondary w-full mt-4"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
