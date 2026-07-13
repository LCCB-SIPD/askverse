#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, symbol_short};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    TotalGifted,
}

#[contract]
pub struct AskVerseGifts;

#[contractimpl]
impl AskVerseGifts {
    /// Record a gift amount (in stroops) and return the new running total.
    pub fn record_gift(env: Env, amount: i128) -> i128 {
        let key = DataKey::TotalGifted;
        let current: i128 = env.storage().instance().get(&key).unwrap_or(0);
        let new_total = current + amount;
        env.storage().instance().set(&key, &new_total);
        new_total
    }

    /// Read the total gifted amount so far.
    pub fn get_total(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalGifted).unwrap_or(0)
    }
}