import { Request, Response, NextFunction } from 'express';
import KarmaService from '../services/karma.service';

export const checkKarmaBlacklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, bvn, accountNumber } = req.body;

    // Collect all available identity fields
    const identities = [];
    if (email) identities.push(email);
    if (phone) identities.push(phone);
    if (bvn) identities.push(bvn);
    if (accountNumber) identities.push(accountNumber);

    // If no identifiable information is provided, skip the check
    if (identities.length === 0) {
      return next();
    }

    // Check all identities against the Karma blacklist
    const { isBlacklisted, blacklistedItems } = await KarmaService.checkMultiple(identities);

    if (isBlacklisted) {
      // Log the blacklist event for security purposes
      console.warn('Registration blocked - Blacklisted identity detected:', blacklistedItems);
      
      return res.status(403).json({
        success: false,
        message: 'Registration not allowed',
        reason: 'Identity matches a record in the blacklist',
        details: blacklistedItems.map(item => ({
          identity: item.identity,
          reason: item.data.reason,
          amount_in_contention: item.data.amount_in_contention,
          default_date: item.data.default_date,
          reported_by: item.data.reporting_entity?.name
        }))
      });
    }

    // If not blacklisted, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error('Error in Karma blacklist check:', error);
    // In case of error, we'll allow the registration to proceed
    // but log the error for investigation
    next();
  }
};

export default checkKarmaBlacklist;
