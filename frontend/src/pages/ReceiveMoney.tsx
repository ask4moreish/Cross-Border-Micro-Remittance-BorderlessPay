import { useState } from 'react'
import { QrCode, Copy, Check, Share2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export function ReceiveMoney() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [showPaymentRequest, setShowPaymentRequest] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Address copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const generatePaymentRequest = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setShowPaymentRequest(true)
  }

  const sharePaymentRequest = () => {
    const requestUrl = `stellar:${user?.publicKey}?amount=${amount}&message=${encodeURIComponent(message)}`
    if (navigator.share) {
      navigator.share({
        title: 'Payment Request',
        text: `Send ${amount} USDC to ${user?.publicKey?.slice(0, 6)}...${user?.publicKey?.slice(-4)}`,
        url: requestUrl,
      })
    } else {
      copyToClipboard(requestUrl)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Please connect your wallet to receive money</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Receive Money</h1>
        <p className="text-muted-foreground">
          Share your wallet address or create a payment request
        </p>
      </motion.div>

      {/* Wallet Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Your Wallet Address</h2>
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="font-mono text-sm break-all mb-4">
            {user.publicKey}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => copyToClipboard(user.publicKey)}
              className="btn btn-outline flex items-center space-x-2"
            >
              {copied ? (
                <><Check className="h-4 w-4" /><span>Copied!</span></>
              ) : (
                <><Copy className="h-4 w-4" /><span>Copy Address</span></>
              )}
            </button>
            <button className="btn btn-outline flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Show QR</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Payment Request */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Create Payment Request</h2>
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Amount (USDC)</label>
            <input
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label mb-2 block">Message (Optional)</label>
            <textarea
              placeholder="What's this payment for?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </div>
          <button
            onClick={generatePaymentRequest}
            className="btn btn-primary w-full"
          >
            Generate Payment Request
          </button>
        </div>
      </motion.div>

      {/* Payment Request Result */}
      {showPaymentRequest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-accent/50"
        >
          <h3 className="text-lg font-semibold mb-4">Payment Request Generated</h3>
          <div className="space-y-4">
            <div className="bg-background p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Share this link:</p>
              <div className="font-mono text-xs break-all">
                stellar:{user.publicKey}?amount={amount}&message={encodeURIComponent(message)}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(`stellar:${user.publicKey}?amount=${amount}&message=${encodeURIComponent(message)}`)}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={sharePaymentRequest}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
