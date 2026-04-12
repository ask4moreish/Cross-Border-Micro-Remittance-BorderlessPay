import { Server, TransactionBuilder, Networks, BASE_FEE, Asset, Keypair } from 'stellar-sdk'
import { logger } from '../utils/logger'

interface StellarTransactionParams {
  from: string
  to: string
  amount: number
  currency: string
  fee: number
  transactionId: string
  message?: string
}

interface StellarTransactionResult {
  id: string
  xdr: string
  hash?: string
}

export const stellarService = {
  async createTransaction(params: StellarTransactionParams): Promise<StellarTransactionResult> {
    try {
      const server = new Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')
      
      // Load source account
      const sourceAccount = await server.loadAccount(params.from)
      
      // Create asset based on currency
      let asset: Asset
      if (params.currency === 'USDC') {
        asset = new Asset('USDC', process.env.USDC_ISSUER || 'GD...')
      } else if (params.currency === 'USDT') {
        asset = new Asset('USDT', process.env.USDT_ISSUER || 'GD...')
      } else {
        throw new Error(`Unsupported currency: ${params.currency}`)
      }

      // Build transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addMemo(params.message ? { text: params.message } : undefined)
        .addOperation({
          type: 'payment',
          destination: params.to,
          asset,
          amount: params.amount.toString(),
        })
        .setTimeout(30)
        .build()

      // Sign transaction (would be signed by client in real implementation)
      const xdr = transaction.toXDR()
      const hash = transaction.hash().toString('hex')

      logger.info(`Stellar transaction created: ${hash}`)

      return {
        id: hash,
        xdr,
        hash,
      }
    } catch (error) {
      logger.error('Error creating Stellar transaction:', error)
      throw error
    }
  },

  async executeTransaction(xdr: string, signature: string): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      const server = new Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')
      
      // Load transaction from XDR
      const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET)
      
      // Add signature
      transaction.addSignature(params.from, signature)
      
      // Submit to network
      const result = await server.submitTransaction(transaction)
      
      if (result.successful) {
        logger.info(`Stellar transaction executed: ${result.hash}`)
        return {
          success: true,
          hash: result.hash,
        }
      } else {
        logger.error(`Stellar transaction failed: ${result.extras?.result_codes}`)
        return {
          success: false,
          error: result.extras?.result_codes?.transaction?.toString() || 'Transaction failed',
        }
      }
    } catch (error) {
      logger.error('Error executing Stellar transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  async refundTransaction(xdr: string, signature: string): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      // Similar to executeTransaction but for refunds
      // In a real implementation, this would create a refund transaction
      logger.info('Processing refund transaction')
      
      // Mock implementation
      return {
        success: true,
        hash: 'refund-' + Math.random().toString(36).substr(2, 9),
      }
    } catch (error) {
      logger.error('Error processing refund:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      }
    }
  },

  async getAccountBalance(publicKey: string): Promise<{ asset: string; balance: string }[]> {
    try {
      const server = new Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')
      const account = await server.loadAccount(publicKey)
      
      const balances = account.balances.map(balance => ({
        asset: balance.asset_type === 'native' ? 'XLM' : (balance as any).asset_code,
        balance: balance.balance,
      }))

      return balances
    } catch (error) {
      logger.error('Error getting account balance:', error)
      throw error
    }
  },

  async getTransactionStatus(transactionHash: string): Promise<{ status: string; details?: any }> {
    try {
      const server = new Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')
      const transaction = await server.transactions().transaction(transactionHash).call()
      
      return {
        status: transaction.successful ? 'SUCCESS' : 'FAILED',
        details: transaction,
      }
    } catch (error) {
      logger.error('Error getting transaction status:', error)
      return {
        status: 'NOT_FOUND',
        error: error instanceof Error ? error.message : 'Transaction not found',
      }
    }
  },

  validateAddress(address: string): boolean {
    try {
      return Keypair.fromPublicKey(address).publicKey() === address
    } catch {
      return false
    }
  },
}
