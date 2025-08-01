import db from '../database/db';

export interface Wallet {
  id?: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at?: Date;
  updated_at?: Date;
}

export const createWallet = async (
  wallet: Omit<Wallet, 'id' | 'created_at' | 'updated_at'>
): Promise<number[]> => {
  return await db('wallets').insert({
    ...wallet,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const findWalletByUserId = async (userId: number): Promise<Wallet | undefined> => {
  return await db('wallets').where({ user_id: userId }).first();
};

export const updateWalletBalance = async (walletId: number, amount: number): Promise<number> => {
  return await db('wallets')
    .where({ id: walletId })
    .increment('balance', amount)
    .update({ updated_at: new Date() });
};

export const withdrawFunds = async (
  walletId: number,
  amount: number,
  description?: string
): Promise<{ success: boolean; message?: string }> => {
  return await db.transaction(async (trx) => {
    // Check if wallet exists and has sufficient balance
    const wallet = await trx('wallets').where('id', walletId).forUpdate().first();

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    // Perform the withdrawal
    await trx('wallets')
      .where('id', walletId)
      .decrement('balance', amount)
      .update({ updated_at: new Date() });

    // Record the withdrawal transaction
    await trx('transactions').insert({
      from_wallet_id: walletId,
      to_wallet_id: null, // Null indicates a withdrawal
      amount,
      currency: wallet.currency,
      description: description || 'Withdrawal',
      status: 'completed',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      message: `Successfully withdrew ${amount} ${wallet.currency}`,
    };
  });
};

export const transferFunds = async (
  fromWalletId: number,
  toWalletId: number,
  amount: number,
  description?: string
): Promise<{ success: boolean; message?: string }> => {
  return await db.transaction(async (trx) => {
    // Check if sender has sufficient balance
    const fromWallet = await trx('wallets').where('id', fromWalletId).forUpdate().first();

    if (!fromWallet) {
      throw new Error('Sender wallet not found');
    }

    if (fromWallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Check if recipient wallet exists
    const toWallet = await trx('wallets').where('id', toWalletId).forUpdate().first();

    if (!toWallet) {
      throw new Error('Recipient wallet not found');
    }

    if (fromWallet.currency !== toWallet.currency) {
      throw new Error('Cannot transfer between different currencies');
    }

    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than zero');
    }

    // Perform the transfer
    await trx('wallets')
      .where('id', fromWalletId)
      .decrement('balance', amount)
      .update({ updated_at: new Date() });

    await trx('wallets')
      .where('id', toWalletId)
      .increment('balance', amount)
      .update({ updated_at: new Date() });

    // Record the transaction
    await trx('transactions').insert({
      from_wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      amount,
      currency: fromWallet.currency,
      description: description || 'Funds transfer',
      status: 'completed',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      message: `Successfully transferred ${amount} ${fromWallet.currency}`,
    };
  });
};
