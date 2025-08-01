export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: number;
  from_wallet_id: number | null;
  to_wallet_id: number | null;
  amount: number;
  type: 'credit' | 'debit' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface KarmaBlacklistResponse {
  karma_identity: string;
  amount_in_contention: string;
  reason: string;
  default_date: string;
  karma_type: { karma: string };
  karma_identity_type: { identity_type: string };
  reporting_entity: { name: string; email: string };
}

export interface KarmaCheckResult {
  isBlacklisted: boolean;
  data?: KarmaBlacklistResponse;
}

export interface KarmaMultipleCheckResult {
  isBlacklisted: boolean;
  blacklistedItems: Array<{
    identity: string;
    data: KarmaBlacklistResponse;
  }>;
}
