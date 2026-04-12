# BorderlessPay - Cross-Border Micro-Remittance Platform

A Web3 peer-to-peer remittance application built on Stellar blockchain that enables migrant workers to send money home instantly using stablecoins with near-zero fees and no bank account requirements.

## 🌟 Features

- **Borderless Transfers**: Send money anywhere in the world without geographical restrictions
- **Near-Zero Fees**: Save 5-10% compared to traditional remittance services (0.3% fee)
- **Instant Settlement**: Transactions complete in seconds, not days
- **No Bank Account Required**: Send and receive using just a crypto wallet
- **Multi-Currency Support**: USDC and USDT stablecoins
- **Secure & Private**: Blockchain-based security with end-to-end encryption
- **KYC Compliant**: Built-in identity verification for regulatory compliance

## 🏗️ Architecture

```
BorderlessPay/
├── frontend/                 # React Web Application
├── backend/                  # Node.js API Server
├── smart-contracts/          # Stellar Smart Contracts
├── shared/                   # Shared utilities and types
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Rust (for smart contracts)

### Using Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BorderlessPay
   ```

2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Start all services:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Manual Setup

#### Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

#### Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

#### Smart Contracts

1. Navigate to smart contracts directory:
   ```bash
   cd smart-contracts
   ```

2. Build contracts:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```

3. Deploy contracts:
   ```bash
   npm run deploy:testnet  # For testnet
   npm run deploy:mainnet  # For mainnet
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/borderlesspay"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Stellar Configuration
STELLAR_RPC_URL="https://horizon-testnet.stellar.org"
STELLAR_NETWORK="TESTNET"
USDC_ISSUER="GDQOE23CFSUMAS4YK2YVNYQ7JIHKALCNVJ3N4KBQ6VDCJWJDFRZM5A"
USDT_ISSUER="GDVDKQFPQ65GQJWHXVHRRHFEVNVJZUSKPQ6J5U5M3YJ5F4D7LJL4K"
```

#### Frontend (.env)

```env
VITE_API_URL="http://localhost:5000/api"
VITE_STELLAR_NETWORK="TESTNET"
VITE_CONTRACT_ID="your-contract-id"
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/connect` - Connect wallet
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/verify-kyc` - Verify KYC
- `POST /api/auth/logout` - Logout

### Transaction Endpoints

- `POST /api/transactions/create` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `GET /api/transactions/user/:userId` - Get user transactions
- `POST /api/transactions/:id/execute` - Execute transaction
- `POST /api/transactions/:id/refund` - Refund transaction

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/balance` - Get balance
- `GET /api/users/stats` - Get statistics

### Stellar Endpoints

- `GET /api/stellar/balance/:publicKey` - Get account balance
- `GET /api/stellar/transaction/:hash` - Get transaction status
- `POST /api/stellar/validate-address` - Validate address
- `GET /api/stellar/exchange-rates` - Get exchange rates

## 🔐 Security Features

- **Smart Contract Escrow**: Funds held in secure escrow until execution
- **Multi-Signature Support**: Additional security for large transactions
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation**: Comprehensive input sanitization
- **Audit Logging**: Complete audit trail for compliance

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Smart Contract Tests

```bash
cd smart-contracts
cargo test
```

## 📦 Deployment

### Production Deployment

1. Build and deploy smart contracts:
   ```bash
   cd smart-contracts
   npm run deploy:mainnet
   ```

2. Deploy backend:
   ```bash
   cd backend
   npm run build
   npm start
   ```

3. Deploy frontend:
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ to your web server
   ```

### Docker Deployment

```bash
# Build and deploy all services
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) - Blockchain infrastructure
- [Soroban](https://soroban.stellar.org/) - Smart contract platform
- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime

## 📞 Support

- Documentation: [docs/](./docs/)
- Issues: [GitHub Issues](https://github.com/your-org/borderlesspay/issues)
- Email: support@borderlesspay.com

## 🌍 Global Impact

BorderlessPay aims to:
- Reduce remittance costs for migrant workers by 90%
- Provide financial access to unbanked populations
- Enable instant cross-border transfers
- Promote financial inclusion through blockchain technology

Join us in revolutionizing cross-border remittances! 🌍💸
