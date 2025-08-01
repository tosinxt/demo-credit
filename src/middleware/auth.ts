import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number };
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    console.log('Headers:', req.headers);
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      console.log('No Authorization header found');
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    
    console.log('Extracted token:', token);

    if (!token) {
      console.log('No token found in Authorization header');
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
    console.log('JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    console.log('Decoded token:', decoded);
    
    req.user = { id: decoded.userId };
    console.log('User authenticated:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      message: 'Token is not valid',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
