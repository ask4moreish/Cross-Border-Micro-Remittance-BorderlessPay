import { useState } from 'react'
import { User, Shield, Bell, Globe, LogOut, Copy, Check, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export function Settings() {
  const { user, disconnectWallet, updateUser } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [currency, setCurrency] = useState('USD')
  const [language, setLanguage] = useState('en')

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

  const handleDisconnect = () => {
    disconnectWallet()
    toast.success('Wallet disconnected successfully')
  }

  const handleSaveSettings = () => {
    // Mock save - in real app, this would save to backend
    toast.success('Settings saved successfully')
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Please connect your wallet to access settings</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Wallet Address</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={user.publicKey}
                readOnly
                className="input flex-1 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(user.publicKey)}
                className="btn btn-outline flex items-center space-x-2"
              >
                {copied ? (
                  <><Check className="h-4 w-4" /><span>Copied!</span></>
                ) : (
                  <><Copy className="h-4 w-4" /><span>Copy</span></>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
            <div>
              <p className="font-medium">KYC Status</p>
              <p className="text-sm text-muted-foreground">
                {user.isKycVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.isKycVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.isKycVerified ? 'Verified' : 'Pending'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <button className="btn btn-outline">
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Transaction Signing</p>
              <p className="text-sm text-muted-foreground">Require confirmation for all transactions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Default Currency</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          <div>
            <label className="label mb-2 block">Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive transaction updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary w-full"
        >
          Save Settings
        </button>
        
        <button
          onClick={handleDisconnect}
          className="btn btn-outline w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect Wallet</span>
        </button>
      </motion.div>
    </div>
  )
}
