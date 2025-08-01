import { Request, Response } from 'express';
import * as walletModel from '../models/wallet';

export interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

interface CreateWalletRequest {
  currency: string;
}

interface FundWalletRequest {
  amount: number;
}

export const createWallet = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currency } = req.body as CreateWalletRequest;
    const userId = req.user.id;

    const existingWallet = await walletModel.findWalletByUserId(userId);
    if (existingWallet) {
      return res.status(400).json({ message: 'User already has a wallet' });
    }

    const [walletId] = await walletModel.createWallet({
      user_id: userId,
      balance: 0,
      currency: currency || 'NGN',
    });

    return res.status(201).json({
      message: 'Wallet created successfully',
      wallet: {
        id: walletId,
        userId,
        balance: 0,
        currency: currency || 'NGN',
      },
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return res.status(500).json({ message: 'Error creating wallet' });
  }
};

export const fundWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount } = req.body as FundWalletRequest;
    const userId = req.user.id;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const wallet = await walletModel.findWalletByUserId(userId);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.id === undefined) {
      throw new Error('Wallet ID is undefined');
    }

    const updatedBalance = await walletModel.updateWalletBalance(wallet.id, amount);

    return res.json({
      message: 'Wallet funded successfully',
      wallet: {
        id: wallet.id,
        userId: wallet.user_id,
        balance: updatedBalance,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error('Error funding wallet:', error);
    return res.status(500).json({ message: 'Error funding wallet' });
  }
};

interface WithdrawRequest {
  amount: number;
  description?: string;
}

interface TransferRequest {
  toWalletId: number;
  amount: number;
  description?: string;
}

export const transfer = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { toWalletId, amount, description } = req.body as TransferRequest;
    const fromUserId = req.user.id;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Get sender's wallet
    const fromWallet = await walletModel.findWalletByUserId(fromUserId);
    if (!fromWallet || !fromWallet.id) {
      return res.status(404).json({ message: 'Sender wallet not found' });
    }

    // Prevent self-transfer
    if (fromWallet.id === toWalletId) {
      return res.status(400).json({ message: 'Cannot transfer to the same wallet' });
    }

    // Perform the transfer
    const result = await walletModel.transferFunds(fromWallet.id, toWalletId, amount, description);

    return res.json({
      message: 'Transfer successful',
      data: result,
    });
  } catch (error) {
    console.error('Transfer error:', error);
    const message = error instanceof Error ? error.message : 'Transfer failed';
    return res.status(400).json({ message });
  }
};

export const withdraw = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount, description } = req.body as WithdrawRequest;
    const userId = req.user.id;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Get user's wallet
    const wallet = await walletModel.findWalletByUserId(userId);
    if (!wallet?.id) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Perform the withdrawal
    const result = await walletModel.withdrawFunds(wallet.id, amount, description);

    return res.json({
      message: 'Withdrawal successful',
      data: result,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    const message = error instanceof Error ? error.message : 'Withdrawal failed';
    return res.status(400).json({ message });
  }
};

export const getWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const wallet = await walletModel.findWalletByUserId(req.user.id);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    return res.json({
      id: wallet.id,
      userId: wallet.user_id,
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return res.status(500).json({ message: 'Error fetching wallet' });
  }
};
