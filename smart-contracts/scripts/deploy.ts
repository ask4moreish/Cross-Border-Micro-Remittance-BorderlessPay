import { 
  Contract, 
  SorobanRpc, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE, 
  xdr 
} from '@stellar/stellar-sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const CONTRACT_WASM_PATH = join(__dirname, '../target/wasm32-unknown-unknown/release/borderlesspay_contracts.wasm');

async function deployContract() {
  console.log('Deploying BorderlessPay Remittance Contract...');

  // Initialize RPC server
  const server = new SorobanRpc(RPC_URL);
  const source = await server.getAccount(process.env.DEPLOYER_PUBLIC_KEY!);

  // Load contract WASM
  const contractWasm = readFileSync(CONTRACT_WASM_PATH);

  // Build transaction to upload contract
  const uploadContractTx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Contract.uploadContractWasm({
        wasm: contractWasm,
      })
    )
    .setTimeout(30)
    .build();

  // Sign and submit upload transaction
  const uploadResult = await server.sendTransaction(uploadContractTx);
  if (uploadResult.status !== 'SUCCESS') {
    throw new Error(`Failed to upload contract: ${uploadResult.errorResult}`);
  }

  const wasmHash = xdr.Hash.fromXDR(uploadResult.resultMetaXdr!.transformations()[0].value());

  // Build transaction to create contract
  const createContractTx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Contract.createStellarAssetContract({
        wasmHash,
      })
    )
    .setTimeout(30)
    .build();

  // Sign and submit create transaction
  const createResult = await server.sendTransaction(createContractTx);
  if (createResult.status !== 'SUCCESS') {
    throw new Error(`Failed to create contract: ${createResult.errorResult}`);
  }

  const contractId = xdr.ScAddress.fromXDR(createResult.resultMetaXdr!.transformations()[0].value()).contractId();

  console.log(`Contract deployed successfully!`);
  console.log(`Contract ID: ${contractId.toString('hex')}`);
  console.log(`WASM Hash: ${wasmHash.toString('hex')}`);

  // Initialize contract with admin settings
  await initializeContract(server, contractId);

  return contractId;
}

async function initializeContract(server: SorobanRpc, contractId: string) {
  console.log('Initializing contract...');

  const source = await server.getAccount(process.env.DEPLOYER_PUBLIC_KEY!);
  const contract = new Contract(contractId);

  const initTx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'initialize',
        ...[
          new xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeContract(xdr.ContractId.fromContractId(contractId))),
          new xdr.ScVal.scvU32(3000), // 0.3% fee rate
          new xdr.ScVal.scvU32(1000),  // min fee
          new xdr.ScVal.scvU32(100000), // max fee
        ]
      )
    )
    .setTimeout(30)
    .build();

  const result = await server.sendTransaction(initTx);
  if (result.status !== 'SUCCESS') {
    throw new Error(`Failed to initialize contract: ${result.errorResult}`);
  }

  console.log('Contract initialized successfully!');
}

// Main deployment function
async function main() {
  try {
    if (!process.env.DEPLOYER_PUBLIC_KEY || !process.env.DEPLOYER_SECRET_KEY) {
      throw new Error('DEPLOYER_PUBLIC_KEY and DEPLOYER_SECRET_KEY environment variables are required');
    }

    const contractId = await deployContract();
    console.log('\n=== Deployment Summary ===');
    console.log(`Contract ID: ${contractId}`);
    console.log(`Network: ${NETWORK_PASSPHRASE === Networks.TESTNET ? 'Testnet' : 'Mainnet'}`);
    console.log('=== End Summary ===\n');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  main();
}

export { deployContract };
