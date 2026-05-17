// Mock stellar-sdk before any imports so Horizon.Server never hits the network
jest.mock('stellar-sdk', () => {
  const actual = jest.requireActual('stellar-sdk')
  return {
    ...actual,
    Horizon: {
      ...actual.Horizon,
      Server: jest.fn().mockImplementation(() => ({
        loadAccount: jest.fn().mockResolvedValue({
          id: 'GBGJD7LOZETXGUQACZNOQ3U5X4PGVVOO7AOVBPFKA4GKTHSGXTRXB5QU',
          sequence: '1',
          incrementSequenceNumber: jest.fn(),
        }),
        submitTransaction: jest.fn().mockResolvedValue({ successful: true, hash: 'mock-hash' }),
        transactions: jest.fn().mockReturnValue({
          transaction: jest.fn().mockReturnValue({ call: jest.fn().mockResolvedValue({ successful: true }) }),
        }),
      })),
    },
  }
})

import { stellarService } from '../services/stellarService'

const VALID_KEY = 'GBGJD7LOZETXGUQACZNOQ3U5X4PGVVOO7AOVBPFKA4GKTHSGXTRXB5QU'

describe('stellarService', () => {
  describe('validateAddress', () => {
    it('returns true for a valid Stellar public key', () => {
      expect(stellarService.validateAddress(VALID_KEY)).toBe(true)
    })

    it('returns false for an invalid address', () => {
      expect(stellarService.validateAddress('not-a-stellar-key')).toBe(false)
      expect(stellarService.validateAddress('')).toBe(false)
    })
  })

  describe('refundTransaction', () => {
    it('returns success with a hash', async () => {
      const result = await stellarService.refundTransaction('xdr', 'sig')
      expect(result.success).toBe(true)
      expect(result.hash).toBeTruthy()
    })
  })

  describe('createTransaction', () => {
    it('throws for unsupported currency', async () => {
      await expect(
        stellarService.createTransaction({
          from: VALID_KEY,
          to: VALID_KEY,
          amount: 10,
          currency: 'BTC',
          fee: 0.03,
          transactionId: 'tx-1',
        })
      ).rejects.toThrow('Unsupported currency: BTC')
    })
  })
})
