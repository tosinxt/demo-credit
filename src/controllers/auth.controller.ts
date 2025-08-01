import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import * as userModel from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

type EmptyObject = Record<string, never>;

export const register = async (
  req: Request<EmptyObject, EmptyObject, RegisterRequest>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    await userModel.createUser({
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (
  req: Request<EmptyObject, EmptyObject, LoginRequest>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as string,
      } as SignOptions,
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in' });
  }
};
