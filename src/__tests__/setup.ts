import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.KARMA_API_KEY = 'test-karma-key';

// Mock logger to prevent console output during tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock database connection
jest.mock('../database/db', () => ({
  __esModule: true,
  default: {
    raw: jest.fn(),
  },
}));
