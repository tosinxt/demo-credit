import { Request, Response } from 'express';
import { User } from '../types';

// Simple mock response implementation
const createMockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  res.send = jest.fn().mockReturnValue(res as Response);
  return res as Response;
};

export const mockRequest = (options: Partial<Request> = {}): Request =>
  ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...options,
  }) as unknown as Request;

export const mockResponse = createMockResponse;
export const mockNext = jest.fn();

export const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  password: 'hashedpassword',
  first_name: 'Test',
  last_name: 'User',
  created_at: new Date(),
  updated_at: new Date(),
};

export interface MockWallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export const mockWallet: MockWallet = {
  id: 1,
  user_id: 1,
  balance: 1000,
  currency: 'NGN',
  created_at: new Date(),
  updated_at: new Date(),
};
