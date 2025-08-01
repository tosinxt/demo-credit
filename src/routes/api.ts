import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';
import checkKarmaBlacklist from '../middleware/karma.middleware';

const router = Router();

// Authentication routes
router.post('/register', checkKarmaBlacklist, authController.register);
router.post('/login', authController.login);

// Wallet routes (protected by authentication)
router.post('/wallets', authenticate, walletController.createWallet);
router.post('/wallets/fund', authenticate, walletController.fundWallet);
router.post('/wallets/withdraw', authenticate, walletController.withdraw);
router.post('/wallets/transfer', authenticate, walletController.transfer);
router.get('/wallets/me', authenticate, walletController.getWallet);

// 404 handler for /api/v1 routes
router.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default router;
