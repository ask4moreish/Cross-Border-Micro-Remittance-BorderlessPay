use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec, symbol_short, token, panic_with_error};
use soroban_sdk::token::TokenClient;

// Contract errors
const ERROR_INSUFFICIENT_BALANCE: &str = "Insufficient balance";
const ERROR_INVALID_RECIPIENT: &str = "Invalid recipient address";
const ERROR_INVALID_AMOUNT: &str = "Invalid amount";
const ERROR_TRANSACTION_FAILED: &str = "Transaction failed";
const ERROR_UNAUTHORIZED: &str = "Unauthorized";
const ERROR_FEE_TOO_LOW: &str = "Fee too low";
const ERROR_ALREADY_EXECUTED: &str = "Transaction already executed";

// Contract data keys
const ADMIN: Symbol = symbol_short!("ADMIN");
const FEE_RATE: Symbol = symbol_short!("FEE_RATE");
const MIN_FEE: Symbol = symbol_short!("MIN_FEE");
const MAX_FEE: Symbol = symbol_short!("MAX_FEE");
const TRANSACTION_COUNTER: Symbol = symbol_short!("TX_COUNT");

#[contract]
pub struct RemittanceContract;

#[contractimpl]
impl RemittanceContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address, fee_rate: u64, min_fee: u64, max_fee: u64) {
        if admin.has_contract() {
            panic_with_error!(env, ERROR_UNAUTHORIZED);
        }

        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&FEE_RATE, &fee_rate);
        env.storage().instance().set(&MIN_FEE, &min_fee);
        env.storage().instance().set(&MAX_FEE, &max_fee);
        env.storage().instance().set(&TRANSACTION_COUNTER, &0u64);
    }

    /// Send remittance with escrow
    pub fn send_remittance(
        env: Env,
        token_address: Address,
        sender: Address,
        recipient: Address,
        amount: i128,
        fee: i128,
        message: Option<Vec<u8>>,
        deadline: u64,
    ) -> u64 {
        // Validate inputs
        if amount <= 0 {
            panic_with_error!(env, ERROR_INVALID_AMOUNT);
        }

        if fee < env.storage().instance().get::<_, u64>(&MIN_FEE).unwrap_or(1000).into() {
            panic_with_error!(env, ERROR_FEE_TOO_LOW);
        }

        // Calculate total amount needed (amount + fee)
        let total_amount = amount + fee;

        // Create transaction record
        let tx_id = Self::increment_transaction_counter(env);

        // Store transaction details
        let tx_key = symbol_short!("TX_");
        let tx_data = (
            tx_id,
            token_address.clone(),
            sender.clone(),
            recipient.clone(),
            amount,
            fee,
            message.clone(),
            deadline,
            false, // executed flag
            env.ledger().timestamp(),
        );
        env.storage().instance().set(&tx_key, &tx_data);

        // Transfer tokens to contract (escrow)
        let token_client = TokenClient::new(&env, &token_address);
        token_client.transfer(&sender, &env.current_contract_address(), &total_amount);

        tx_id
    }

    /// Execute remittance (release from escrow)
    pub fn execute_remittance(
        env: Env,
        tx_id: u64,
        token_address: Address,
        recipient: Address,
    ) {
        let tx_key = symbol_short!("TX_");
        let tx_data: (u64, Address, Address, Address, i128, i128, Option<Vec<u8>>, u64, bool, u64) = 
            env.storage().instance().get(&tx_key).unwrap_or_else(|| {
                panic_with_error!(env, ERROR_TRANSACTION_FAILED);
            });

        let (stored_tx_id, _, _, stored_recipient, amount, fee, _, deadline, executed, _) = tx_data;

        // Validate transaction
        if stored_tx_id != tx_id {
            panic_with_error!(env, ERROR_TRANSACTION_FAILED);
        }

        if stored_recipient != recipient {
            panic_with_error!(env, ERROR_UNAUTHORIZED);
        }

        if executed {
            panic_with_error!(env, ERROR_ALREADY_EXECUTED);
        }

        if env.ledger().timestamp() > deadline {
            panic_with_error!(env, ERROR_TRANSACTION_FAILED);
        }

        // Update executed flag
        let updated_tx_data = (
            stored_tx_id,
            token_address.clone(),
            Address::from_contract_id(&env.current_contract_address()),
            stored_recipient,
            amount,
            fee,
            None,
            deadline,
            true, // executed
            env.ledger().timestamp(),
        );
        env.storage().instance().set(&tx_key, &updated_tx_data);

        // Transfer tokens to recipient
        let token_client = TokenClient::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        // Transfer fee to admin
        let admin = env.storage().instance().get::<_, Address>(&ADMIN).unwrap();
        token_client.transfer(&env.current_contract_address(), &admin, &fee);
    }

    /// Refund transaction (if deadline passed)
    pub fn refund_transaction(env: Env, tx_id: u64, token_address: Address, sender: Address) {
        let tx_key = symbol_short!("TX_");
        let tx_data: (u64, Address, Address, Address, i128, i128, Option<Vec<u8>>, u64, bool, u64) = 
            env.storage().instance().get(&tx_key).unwrap_or_else(|| {
                panic_with_error!(env, ERROR_TRANSACTION_FAILED);
            });

        let (stored_tx_id, _, stored_sender, _, amount, fee, _, deadline, executed, _) = tx_data;

        // Validate transaction
        if stored_tx_id != tx_id {
            panic_with_error!(env, ERROR_TRANSACTION_FAILED);
        }

        if stored_sender != sender {
            panic_with_error!(env, ERROR_UNAUTHORIZED);
        }

        if executed {
            panic_with_error!(env, ERROR_ALREADY_EXECUTED);
        }

        if env.ledger().timestamp() <= deadline {
            panic_with_error!(env, ERROR_TRANSACTION_FAILED);
        }

        // Update executed flag
        let updated_tx_data = (
            stored_tx_id,
            token_address.clone(),
            stored_sender,
            Address::from_contract_id(&env.current_contract_address()),
            amount,
            fee,
            None,
            deadline,
            true, // executed
            env.ledger().timestamp(),
        );
        env.storage().instance().set(&tx_key, &updated_tx_data);

        // Refund total amount (amount + fee) to sender
        let total_amount = amount + fee;
        let token_client = TokenClient::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &sender, &total_amount);
    }

    /// Get transaction details
    pub fn get_transaction(env: Env, tx_id: u64) -> Option<(u64, Address, Address, Address, i128, i128, Option<Vec<u8>>, u64, bool, u64)> {
        let tx_key = symbol_short!("TX_");
        env.storage().instance().get(&tx_key)
    }

    /// Get contract configuration
    pub fn get_config(env: Env) -> (Address, u64, u64, u64) {
        let admin = env.storage().instance().get::<_, Address>(&ADMIN).unwrap();
        let fee_rate = env.storage().instance().get::<_, u64>(&FEE_RATE).unwrap_or(3000); // 0.3%
        let min_fee = env.storage().instance().get::<_, u64>(&MIN_FEE).unwrap_or(1000);
        let max_fee = env.storage().instance().get::<_, u64>(&MAX_FEE).unwrap_or(100000);
        (admin, fee_rate, min_fee, max_fee)
    }

    /// Update configuration (admin only)
    pub fn update_config(env: Env, admin: Address, fee_rate: Option<u64>, min_fee: Option<u64>, max_fee: Option<u64>) {
        let current_admin = env.storage().instance().get::<_, Address>(&ADMIN).unwrap();
        if current_admin != admin {
            panic_with_error!(env, ERROR_UNAUTHORIZED);
        }

        if let Some(new_fee_rate) = fee_rate {
            env.storage().instance().set(&FEE_RATE, &new_fee_rate);
        }
        if let Some(new_min_fee) = min_fee {
            env.storage().instance().set(&MIN_FEE, &new_min_fee);
        }
        if let Some(new_max_fee) = max_fee {
            env.storage().instance().set(&MAX_FEE, &new_max_fee);
        }
    }

    /// Get transaction count
    pub fn get_transaction_count(env: Env) -> u64 {
        env.storage().instance().get::<_, u64>(&TRANSACTION_COUNTER).unwrap_or(0)
    }

    /// Helper function to increment transaction counter
    fn increment_transaction_counter(env: Env) -> u64 {
        let count = env.storage().instance().get::<_, u64>(&TRANSACTION_COUNTER).unwrap_or(0);
        let new_count = count + 1;
        env.storage().instance().set(&TRANSACTION_COUNTER, &new_count);
        new_count
    }
}
