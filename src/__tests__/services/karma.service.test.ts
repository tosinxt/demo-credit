import axios from 'axios';
import KarmaService from '../../services/karma.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('KarmaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.KARMA_API_KEY = 'test-api-key';
  });

  describe('checkBlacklist', () => {
    it('should return true if identity is blacklisted', async () => {
      const mockResponse = {
        karma_identity: 'test@example.com',
        amount_in_contention: '1000',
        reason: 'Fraudulent activity',
        default_date: '2023-01-01',
        karma_type: { karma: 'Fraud' },
        karma_identity_type: { identity_type: 'Email' },
        reporting_entity: { name: 'Test Bank', email: 'fraud@testbank.com' },
      };

      mockedAxios.get.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await KarmaService.checkBlacklist('test@example.com');
      expect(result.isBlacklisted).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://adjutor.lendsqr.com/v2/verification/karma/test%40example.com',
        {
          headers: {
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
          validateStatus: expect.any(Function),
        }
      );
    });

    it('should return false if identity is not blacklisted', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      const result = await KarmaService.checkBlacklist('safe@example.com');
      expect(result.isBlacklisted).toBe(false);
      expect(result.data).toBeUndefined();
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await KarmaService.checkBlacklist('error@example.com');
      expect(result.isBlacklisted).toBe(false);
    });
  });

  describe('checkMultiple', () => {
    it('should check multiple identities against blacklist', async () => {
      const mockResponse = {
        karma_identity: 'test@example.com',
        amount_in_contention: '1000',
        reason: 'Fraudulent activity',
      };

      mockedAxios.get
        .mockResolvedValueOnce({ status: 200, data: mockResponse }) // First call - blacklisted
        .mockRejectedValueOnce({ response: { status: 404 } }) // Second call - not blacklisted
        .mockRejectedValueOnce(new Error('API Error')); // Third call - error

      const identities = ['test@example.com', 'safe@example.com', 'error@example.com'];
      const result = await KarmaService.checkMultiple(identities);

      expect(result.isBlacklisted).toBe(true);
      expect(result.blacklistedItems).toHaveLength(1);
      expect(result.blacklistedItems[0].identity).toBe('test@example.com');
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });
});
