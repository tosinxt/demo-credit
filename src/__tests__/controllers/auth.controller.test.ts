import * as authController from '../../controllers/auth.controller';
import * as userModel from '../../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockRequest, mockResponse, mockNext, mockUser } from '../test-utils';

// Mock dependencies
jest.mock('../../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Controller', () => {
  let req: any, res: any, next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      req.body = userData;
      (userModel.findUserByEmail as jest.Mock).mockResolvedValue(null);
      mockedBcrypt.genSalt.mockResolvedValue('salt' as never);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      (userModel.createUser as jest.Mock).mockResolvedValue(1);

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
      expect(userModel.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        first_name: 'Test',
        last_name: 'User',
      });
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      req.body = userData;
      (userModel.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      req.body = loginData;
      (userModel.findUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword',
      });
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue('fake-jwt-token' as never);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'fake-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.first_name,
          lastName: mockUser.last_name,
        },
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      req.body = loginData;
      (userModel.findUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword',
      });
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
});
