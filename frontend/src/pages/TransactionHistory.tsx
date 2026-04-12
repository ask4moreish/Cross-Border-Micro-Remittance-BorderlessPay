import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'

interface Transaction {
  id: string
  type: 'sent' | 'received'
  amount: number
  currency: string
  recipient?: string
  sender?: string
  message?: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: Date
  fee: number
}

export function TransactionHistory() {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all')

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'sent',
        amount: 250.00,
        currency: 'USDC',
        recipient: 'GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        message: 'Monthly support',
        status: 'completed',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        fee: 0.75,
      },
      {
        id: '2',
        type: 'received',
        amount: 500.00,
        currency: 'USDT',
        sender: 'GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        message: 'Salary payment',
        status: 'completed',
        timestamp: new Date('2024-01-14T14:20:00Z'),
        fee: 1.50,
      },
      {
        id: '3',
        type: 'sent',
        amount: 100.00,
        currency: 'USDC',
        recipient: 'GXYZ1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        status: 'pending',
        timestamp: new Date('2024-01-16T09:15:00Z'),
        fee: 0.30,
      },
    ]
    setTransactions(mockTransactions)
    setFilteredTransactions(mockTransactions)
  }, [user])

  useEffect(() => {
    let filtered = transactions

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter)
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">
          View and track all your remittance transactions
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`btn ${filter === 'sent' ? 'btn-primary' : 'btn-outline'}`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`btn ${filter === 'received' ? 'btn-primary' : 'btn-outline'}`}
          >
            Received
          </button>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No transactions found</div>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Start sending money to see your transaction history'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {transaction.type === 'sent' ? (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {transaction.type === 'sent' ? 'Sent' : 'Received'}
                      </span>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.message || 'No message'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(transaction.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'sent' ? '-' : '+'}
                    {transaction.amount.toFixed(2)} {transaction.currency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Fee: {transaction.fee.toFixed(4)} {transaction.currency}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {transaction.recipient?.slice(0, 6)}...{transaction.recipient?.slice(-4) ||
                     transaction.sender?.slice(0, 6)}...{transaction.sender?.slice(-4)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
