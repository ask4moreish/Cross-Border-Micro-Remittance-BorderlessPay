import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Wallet, Menu, X, LogOut, Home, Send, Receive, History, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { user, isAuthenticated, connectWallet, disconnectWallet } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Send Money', href: '/send', icon: Send },
    { name: 'Receive Money', href: '/receive', icon: Receive },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BP</span>
            </div>
            <span className="font-bold text-xl">BorderlessPay</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Connected as</p>
                    <p className="font-mono text-xs">
                      {user.publicKey.slice(0, 6)}...{user.publicKey.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t py-4"
            >
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-accent ${
                        isActive ? 'text-primary bg-accent' : 'text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                {user && (
                  <div className="px-3 py-2 border-t mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Connected as</p>
                    <p className="font-mono text-xs">
                      {user.publicKey.slice(0, 6)}...{user.publicKey.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
