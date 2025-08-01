// Mock the database module before importing the module under test
jest.mock('../../database/db', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import * as walletModel from '../../models/wallet';
import { mockWallet } from '../test-utils';
import db from '../../database/db';

// Create a type for our mock query builder
type MockQueryBuilder = {
  insert: jest.Mock<unknown, unknown[]>;
  where: jest.Mock<unknown, unknown[]>;
  first: jest.Mock<unknown, unknown[]>;
  increment: jest.Mock<unknown, unknown[]>;
  update: jest.Mock<unknown, unknown[]>;
  transaction: jest.Mock<unknown, unknown[]>;
  // Add other Knex query builder methods as needed
};

describe('Wallet Model', () => {
  let mockQueryBuilder: MockQueryBuilder;
  const mockDb = db as jest.MockedFunction<typeof db>;

  beforeEach(() => {
    // Create a new query builder for each test
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      increment: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      transaction: jest.fn().mockImplementation((callback) => callback(mockQueryBuilder)),
    };

    // Mock the db function to return our query builder
    (db as jest.Mock).mockImplementation(() => mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create a new wallet', async () => {
      const walletData = {
        user_id: 1,
        balance: 0,
        currency: 'NGN',
      };

      const insertId = 1;
      // Mock the insert to return an array with the insert ID
      (mockQueryBuilder.insert as jest.Mock).mockResolvedValueOnce([insertId]);

      const result = await walletModel.createWallet(walletData);
      
      // The actual implementation returns the insert ID
      expect(result).toEqual([insertId]);
      
      // Verify the insert was called with the correct data
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        ...walletData,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });
  });

  describe('findWalletByUserId', () => {
    it('should find a wallet by user ID', async () => {
      const userId = 1;
      // Mock the first() call to return the mock wallet
      (mockQueryBuilder.first as jest.Mock).mockResolvedValueOnce(mockWallet);

      const result = await walletModel.findWalletByUserId(userId);
      
      expect(result).toEqual(mockWallet);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user_id: userId });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
    });

    it('should return undefined if wallet not found', async () => {
      const userId = 999;
      // Mock the first() call to return undefined
      (mockQueryBuilder.first as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await walletModel.findWalletByUserId(userId);
      
      expect(result).toBeUndefined();
    });
  });

  describe('updateWalletBalance', () => {
    it('should update wallet balance', async () => {
      const walletId = 1;
      const amount = 100;
      
      // Mock the update to return the number of affected rows
      (mockQueryBuilder.update as jest.Mock).mockResolvedValueOnce(1);

      const result = await walletModel.updateWalletBalance(walletId, amount);
      
      expect(result).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: walletId });
      expect(mockQueryBuilder.increment).toHaveBeenCalledWith('balance', amount);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ 
        updated_at: expect.any(Date) 
      });
    });
  });
});
