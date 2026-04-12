import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { Card } from '../components/ui/Card'
import { BalanceCard } from '../components/BalanceCard'
import { RecentTransactions } from '../components/RecentTransactions'
import { QuickActions } from '../components/QuickActions'

export function Dashboard() {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState({
    usdc: 0,
    usdt: 0,
    totalUSD: 0,
  })
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    transactionCount: 0,
    feesSaved: 0,
  })

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setBalance({
      usdc: 1250.50,
      usdt: 750.25,
      totalUSD: 2000.75,
    })

    setStats({
      totalSent: 5000,
      totalReceived: 3000,
      transactionCount: 24,
      feesSaved: 450,
    })
  }, [user])

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            {user?.publicKey ? `${user.publicKey.slice(0, 6)}...${user.publicKey.slice(-4)}` : 'User'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {user?.isKycVerified ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">KYC Verified</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">KYC Pending</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard
          title="USDC Balance"
          amount={balance.usdc}
          change={2.5}
          icon={DollarSign}
        />
        <BalanceCard
          title="USDT Balance"
          amount={balance.usdt}
          change={-1.2}
          icon={DollarSign}
        />
        <BalanceCard
          title="Total Balance"
          amount={balance.totalUSD}
          change={1.8}
          icon={TrendingUp}
          highlight
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">${stats.totalSent.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">${stats.totalReceived.toLocaleString()}</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{stats.transactionCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fees Saved</p>
                <p className="text-2xl font-bold text-green-600">${stats.feesSaved}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
