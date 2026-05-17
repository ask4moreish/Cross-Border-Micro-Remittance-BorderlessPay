import { Request, Response } from 'express'
import { stellarController } from '../controllers/stellarController'
import { stellarService } from '../services/stellarService'

jest.mock('../services/stellarService', () => ({
  stellarService: {
    validateAddress: jest.fn(),
    getAccountBalance: jest.fn(),
    getTransactionStatus: jest.fn(),
  },
}))

const mockRes = () => {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res as Response
}

describe('stellarController', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('validateAddress', () => {
    it('returns 400 when address missing', async () => {
      const req = { body: {} } as Request
      const res = mockRes()
      await stellarController.validateAddress(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns isValid result', async () => {
      ;(stellarService.validateAddress as jest.Mock).mockReturnValue(true)
      const req = { body: { address: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN' } } as Request
      const res = mockRes()
      await stellarController.validateAddress(req, res)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })
  })

  describe('getExchangeRates', () => {
    it('returns exchange rates', async () => {
      const req = {} as Request
      const res = mockRes()
      await stellarController.getExchangeRates(req, res)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: expect.objectContaining({ exchangeRates: expect.any(Object) }) })
      )
    })
  })
})
