import * as userModel from '../../models/user';
import { mockUser } from '../test-utils';

// Mock the database module
jest.mock('../../database/db', () => ({
  __esModule: true,
  default: jest.fn().mockReturnThis(),
}));

// Import the mock after setting it up
import db from '../../database/db';

// Create a type for our mock query builder
type MockQueryBuilder = {
  insert: jest.Mock;
  where: jest.Mock;
  first: jest.Mock;
  returning: jest.Mock;
  into: jest.Mock;
};

describe('User Model', () => {
  let mockQueryBuilder: MockQueryBuilder;
  const mockDb = db as jest.MockedFunction<typeof db>;

  beforeEach(() => {
    // Create a new query builder for each test
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      returning: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
    };

    // Mock the db function to return our query builder
    mockDb.mockImplementation(() => mockQueryBuilder as unknown as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };

      const insertId = 1;
      mockQueryBuilder.insert.mockResolvedValue([insertId]);

      const result = await userModel.createUser(userData);
      
      expect(result).toEqual([insertId]);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        ...userData,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      mockQueryBuilder.first.mockResolvedValue(mockUser);

      const result = await userModel.findUserByEmail(email);
      
      expect(result).toEqual(mockUser);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ email });
    });

    it('should return undefined if user not found', async () => {
      const email = 'nonexistent@example.com';
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const result = await userModel.findUserByEmail(email);
      
      expect(result).toBeUndefined();
    });
  });
});
