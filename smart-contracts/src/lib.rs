#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Symbol, symbol_short, token};
use soroban_sdk::token::TokenClient;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    InvalidAmount = 3,
    FeeTooLow = 4,
    TransactionNotFound = 5,
    AlreadyExecuted = 6,
    DeadlineNotPassed = 7,
    DeadlinePassed = 8,
}

const ADMIN: Symbol = symbol_short!("ADMIN");
const FEE_RATE: Symbol = symbol_short!("FEE_RATE");
const MIN_FEE: Symbol = symbol_short!("MIN_FEE");
const TX_COUNT: Symbol = symbol_short!("TX_COUNT");

#[contracttype]
#[derive(Clone)]
pub struct Transaction {
    pub id: u64,
    pub token: Address,
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub fee: i128,
    pub deadline: u64,
    pub executed: bool,
    pub created_at: u64,
}

fn tx_key(id: u64) -> (Symbol, u64) {
    (symbol_short!("TX"), id)
}

#[contract]
pub struct RemittanceContract;

#[contractimpl]
impl RemittanceContract {
    pub fn initialize(env: Env, admin: Address, fee_rate: u64, min_fee: u64) {
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&FEE_RATE, &fee_rate);
        env.storage().instance().set(&MIN_FEE, &min_fee);
        env.storage().instance().set(&TX_COUNT, &0u64);
    }

    pub fn send_remittance(
        env: Env,
        token_address: Address,
        sender: Address,
        recipient: Address,
        amount: i128,
        fee: i128,
        deadline: u64,
    ) -> u64 {
        if amount <= 0 {
            panic!("invalid amount");
        }
        let min_fee = env.storage().instance().get::<_, u64>(&MIN_FEE).unwrap_or(0) as i128;
        if fee < min_fee {
            panic!("fee too low");
        }

        let count: u64 = env.storage().instance().get(&TX_COUNT).unwrap_or(0);
        let tx_id = count + 1;
        env.storage().instance().set(&TX_COUNT, &tx_id);

        let tx = Transaction {
            id: tx_id,
            token: token_address.clone(),
            sender: sender.clone(),
            recipient,
            amount,
            fee,
            deadline,
            executed: false,
            created_at: env.ledger().timestamp(),
        };
        env.storage().instance().set(&tx_key(tx_id), &tx);

        let total = amount + fee;
        TokenClient::new(&env, &token_address).transfer(
            &sender,
            &env.current_contract_address(),
            &total,
        );

        tx_id
    }

    pub fn execute_remittance(env: Env, tx_id: u64) {
        let key = tx_key(tx_id);
        let mut tx: Transaction = env.storage().instance().get(&key).expect("not found");

        if tx.executed {
            panic!("already executed");
        }
        if env.ledger().timestamp() > tx.deadline {
            panic!("deadline passed");
        }

        tx.executed = true;
        env.storage().instance().set(&key, &tx);

        let client = TokenClient::new(&env, &tx.token);
        client.transfer(&env.current_contract_address(), &tx.recipient, &tx.amount);

        let admin: Address = env.storage().instance().get(&ADMIN).expect("no admin");
        client.transfer(&env.current_contract_address(), &admin, &tx.fee);
    }

    pub fn refund_transaction(env: Env, tx_id: u64) {
        let key = tx_key(tx_id);
        let mut tx: Transaction = env.storage().instance().get(&key).expect("not found");

        if tx.executed {
            panic!("already executed");
        }
        if env.ledger().timestamp() <= tx.deadline {
            panic!("deadline not passed");
        }

        tx.executed = true;
        env.storage().instance().set(&key, &tx);

        let total = tx.amount + tx.fee;
        TokenClient::new(&env, &tx.token).transfer(
            &env.current_contract_address(),
            &tx.sender,
            &total,
        );
    }

    pub fn get_transaction(env: Env, tx_id: u64) -> Option<Transaction> {
        env.storage().instance().get(&tx_key(tx_id))
    }

    pub fn get_transaction_count(env: Env) -> u64 {
        env.storage().instance().get(&TX_COUNT).unwrap_or(0)
    }

    pub fn get_config(env: Env) -> (Address, u64, u64) {
        let admin: Address = env.storage().instance().get(&ADMIN).expect("no admin");
        let fee_rate: u64 = env.storage().instance().get(&FEE_RATE).unwrap_or(3000);
        let min_fee: u64 = env.storage().instance().get(&MIN_FEE).unwrap_or(1000);
        (admin, fee_rate, min_fee)
    }

    pub fn update_config(env: Env, caller: Address, fee_rate: Option<u64>, min_fee: Option<u64>) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&ADMIN).expect("no admin");
        if caller != admin {
            panic!("unauthorized");
        }
        if let Some(v) = fee_rate {
            env.storage().instance().set(&FEE_RATE, &v);
        }
        if let Some(v) = min_fee {
            env.storage().instance().set(&MIN_FEE, &v);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::{StellarAssetClient, TokenClient},
        Address, Env,
    };

    fn setup() -> (Env, RemittanceContractClient<'static>, Address, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, RemittanceContract);
        let client = RemittanceContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        // Deploy a Stellar asset (mock token)
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
        let token_address = token_contract.address();

        // Mint tokens to sender
        let asset_client = StellarAssetClient::new(&env, &token_address);
        asset_client.mint(&sender, &10_000_i128);

        client.initialize(&admin, &3000u64, &100u64);

        (env, client, admin, sender, recipient, token_address)
    }

    #[test]
    fn test_initialize() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RemittanceContract);
        let client = RemittanceContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        client.initialize(&admin, &3000u64, &100u64);
        let (stored_admin, fee_rate, min_fee) = client.get_config();
        assert_eq!(stored_admin, admin);
        assert_eq!(fee_rate, 3000);
        assert_eq!(min_fee, 100);
    }

    #[test]
    fn test_send_and_execute_remittance() {
        let (env, client, _admin, sender, recipient, token_address) = setup();

        env.ledger().with_mut(|l| l.timestamp = 1000);
        let deadline = 2000u64;

        let tx_id = client.send_remittance(
            &token_address,
            &sender,
            &recipient,
            &1000_i128,
            &100_i128,
            &deadline,
        );
        assert_eq!(tx_id, 1);
        assert_eq!(client.get_transaction_count(), 1);

        // Verify escrow: sender balance reduced
        let token = TokenClient::new(&env, &token_address);
        assert_eq!(token.balance(&sender), 10_000 - 1100);

        client.execute_remittance(&tx_id);

        // Recipient received amount
        assert_eq!(token.balance(&recipient), 1000);

        let tx = client.get_transaction(&tx_id).unwrap();
        assert!(tx.executed);
    }

    #[test]
    fn test_refund_after_deadline() {
        let (env, client, _admin, sender, recipient, token_address) = setup();

        env.ledger().with_mut(|l| l.timestamp = 1000);
        let deadline = 2000u64;

        let tx_id = client.send_remittance(
            &token_address,
            &sender,
            &recipient,
            &1000_i128,
            &100_i128,
            &deadline,
        );

        // Advance past deadline
        env.ledger().with_mut(|l| l.timestamp = 3000);
        client.refund_transaction(&tx_id);

        let token = TokenClient::new(&env, &token_address);
        assert_eq!(token.balance(&sender), 10_000); // fully refunded
    }

    #[test]
    #[should_panic(expected = "invalid amount")]
    fn test_send_zero_amount_panics() {
        let (env, client, _admin, sender, recipient, token_address) = setup();
        env.ledger().with_mut(|l| l.timestamp = 1000);
        client.send_remittance(&token_address, &sender, &recipient, &0_i128, &100_i128, &2000u64);
    }
}
