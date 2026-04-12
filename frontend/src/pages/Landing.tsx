import { ArrowRight, Globe, Shield, Zap, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export function Landing() {
  const { connectWallet } = useAuthStore()
  const navigate = useNavigate()

  const handleGetStarted = async () => {
    try {
      await connectWallet()
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const features = [
    {
      icon: Globe,
      title: 'Borderless Transfers',
      description: 'Send money anywhere in the world without geographical restrictions',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Blockchain-based security with end-to-end encryption',
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'Transactions complete in seconds, not days',
    },
    {
      icon: Users,
      title: 'No Bank Account Required',
      description: 'Send and receive using just a crypto wallet',
    },
    {
      icon: TrendingUp,
      title: 'Near-Zero Fees',
      description: 'Save 5-10% compared to traditional remittance services',
    },
  ]

  const stats = [
    { label: 'Transaction Fee', value: '< 0.5%', description: 'vs 5-10% traditional' },
    { label: 'Settlement Time', value: 'Seconds', description: 'vs 3-5 days traditional' },
    { label: 'Global Reach', value: '190+', description: 'countries supported' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              BorderlessPay
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Send money home instantly using stablecoins with near-zero fees. 
              No bank account required on either end.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Migrant workers lose 5–10% of every remittance to banks and agents. 
              Our Web3 peer-to-peer transfer app lets you keep more of your hard-earned money.
            </p>
            <motion.button
              onClick={handleGetStarted}
              className="btn btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose BorderlessPay?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for migrant workers, powered by blockchain technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-accent/50 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, fast, and secure remittance in 3 easy steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Connect Wallet', description: 'Connect your crypto wallet (Freighter, Albedo, etc.)' },
              { step: '2', title: 'Send Money', description: 'Enter recipient details and amount in stablecoins' },
              { step: '3', title: 'Instant Delivery', description: 'Recipient receives funds instantly in their wallet' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Save on Remittance Fees?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of migrant workers who are already saving money with BorderlessPay
            </p>
            <motion.button
              onClick={handleGetStarted}
              className="btn btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Sending Today</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
