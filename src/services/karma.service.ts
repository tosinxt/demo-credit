import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface KarmaResponse {
  karma_identity: string;
  amount_in_contention: string;
  reason: string | null;
  default_date: string;
  karma_type: { karma: string };
  karma_identity_type: { identity_type: string };
  reporting_entity: { name: string; email: string };
}

export class KarmaService {
  private static readonly KARMA_API_URL = 'https://adjutor.lendsqr.com/v2/verification/karma';
  private static readonly KARMA_API_KEY = process.env.KARMA_API_KEY;

  /**
   * Check if an identity is blacklisted in Karma
   * @param identity Email, Phone, Domain, BVN, or NUBAN to check
   * @returns Promise<{isBlacklisted: boolean, data?: KarmaResponse}>
   */
  static async checkBlacklist(identity: string): Promise<{ isBlacklisted: boolean; data?: KarmaResponse }> {
    try {
      if (!this.KARMA_API_KEY) {
        console.error('KARMA_API_KEY is not set in environment variables');
        return { isBlacklisted: false };
      }

      const response = await axios.get<KarmaResponse>(`${this.KARMA_API_URL}/${encodeURIComponent(identity)}`, {
        headers: {
          'Authorization': `Bearer ${this.KARMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (response.status === 200) {
        return { isBlacklisted: true, data: response.data };
      }

      // 404 means not found in blacklist
      return { isBlacklisted: false };
    } catch (error) {
      console.error('Error checking Karma blacklist:', error);
      // In case of error, we allow the process to continue but log the error
      return { isBlacklisted: false };
    }
  }

  /**
   * Check multiple identities against the Karma blacklist
   * @param identities Array of identities to check
   * @returns Promise<{isBlacklisted: boolean, blacklistedItems: Array<{identity: string, data: KarmaResponse}>}>
   */
  static async checkMultiple(identities: string[]) {
    const results = await Promise.all(
      identities.map(async (identity) => {
        const { isBlacklisted, data } = await this.checkBlacklist(identity);
        return { identity, isBlacklisted, data };
      })
    );

    const blacklistedItems = results.filter((r) => r.isBlacklisted && r.data);
    
    return {
      isBlacklisted: blacklistedItems.length > 0,
      blacklistedItems: blacklistedItems.map(({ identity, data }) => ({
        identity,
        data: data!,
      })),
    };
  }
}

export default KarmaService;
