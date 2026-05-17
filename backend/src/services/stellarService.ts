import { Horizon, TransactionBuilder, Networks, BASE_FEE, Asset, Keypair, Operation, Memo } from 'stellar-sdk'
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
      const server = new Horizon.Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')

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
      const builder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination: params.to,
          asset,
          amount: params.amount.toString(),
        }))
        .setTimeout(30)

      if (params.message) {
        builder.addMemo(Memo.text(params.message))
      }

      const transaction = builder.build()
      const xdr = transaction.toXDR()
      const hash = transaction.hash().toString('hex')

      logger.info(`Stellar transaction created: ${hash}`)

      return { id: hash, xdr, hash }
    } catch (error) {
      logger.error('Error creating Stellar transaction:', error)
      throw error
    }
  },

  async executeTransaction(xdr: string, signature: string): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      const server = new Horizon.Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')

      // Load transaction from XDR
      const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET)

      // Submit to network (signature already applied by client)
      const result = await server.submitTransaction(transaction)

      if (result.successful) {
        logger.info(`Stellar transaction executed: ${result.hash}`)
        return { success: true, hash: result.hash }
      } else {
        const codes = (result as any).extras?.result_codes
        logger.error(`Stellar transaction failed: ${codes}`)
        return { success: false, error: codes?.transaction?.toString() || 'Transaction failed' }
      }
    } catch (error) {
      logger.error('Error executing Stellar transaction:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
      const server = new Horizon.Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')
      const account = await server.loadAccount(publicKey)

      return account.balances.map(balance => ({
        asset: balance.asset_type === 'native' ? 'XLM' : (balance as any).asset_code,
        balance: balance.balance,
      }))
    } catch (error) {
      logger.error('Error getting account balance:', error)
      throw error
    }
  },

  async getTransactionStatus(transactionHash: string): Promise<{ status: string; details?: any; error?: string }> {
    try {
      const server = new Horizon.Server(process.env.STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org')
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
