import { expect } from '@open-wc/testing';
import { errorHandler, withRetry } from './error-handler.js';

describe('Error Handler Service', () => {
  describe('errorHandler.handle', () => {
    it('should handle network errors', () => {
      const error = new TypeError('Failed to fetch');
      const appError = errorHandler.handle(error);

      expect(appError.code).to.equal('NETWORK_ERROR');
      expect(appError.userMessage).to.include('connect to the server');
      expect(appError.retryable).to.equal(true);
    });

    it('should handle HTTP 401 errors', () => {
      const error = new Response(null, { status: 401, statusText: 'Unauthorized' });
      const appError = errorHandler.handle(error);

      expect(appError.code).to.equal('AUTH_ERROR');
      expect(appError.userMessage).to.include('Authentication');
      expect(appError.retryable).to.equal(false);
    });

    it('should handle HTTP 404 errors', () => {
      const error = new Response(null, { status: 404, statusText: 'Not Found' });
      const appError = errorHandler.handle(error);

      expect(appError.code).to.equal('NOT_FOUND');
      expect(appError.userMessage).to.include('not found');
      expect(appError.retryable).to.equal(false);
    });

    it('should handle HTTP 500 errors', () => {
      const error = new Response(null, { status: 500, statusText: 'Internal Server Error' });
      const appError = errorHandler.handle(error);

      expect(appError.code).to.equal('SERVER_ERROR');
      expect(appError.userMessage).to.include('Something went wrong');
      expect(appError.retryable).to.equal(true);
    });

    it('should handle unknown errors', () => {
      const error = new Error('Some unknown error');
      const appError = errorHandler.handle(error);

      expect(appError.code).to.equal('UNKNOWN_ERROR');
      expect(appError.retryable).to.equal(false);
    });

    it('should handle HTTP error messages in Error objects as UNKNOWN_ERROR', () => {
      const error = new Error('HTTP 401: Unauthorized');
      const appError = errorHandler.handle(error);

      expect(appError.code).to.equal('UNKNOWN_ERROR');
    });

    it('should handle string errors', () => {
      const appError = errorHandler.handle('String error message');

      expect(appError.code).to.equal('UNKNOWN_ERROR');
      expect(appError.message).to.equal('String error message');
    });

    it('should handle null/undefined errors', () => {
      const appError = errorHandler.handle(null);

      expect(appError.code).to.equal('UNKNOWN_ERROR');
      expect(appError.message).to.equal('An unknown error occurred');
    });
  });

  describe('withRetry', () => {
    it('should return result on success', async () => {
      let callCount = 0;
      const operation = async () => {
        callCount++;
        return 'success';
      };

      const result = await withRetry(operation, { maxRetries: 3, delay: 10 });

      expect(result).to.equal('success');
      expect(callCount).to.equal(1);
    });

    it('should retry on failure', async () => {
      let callCount = 0;
      const operation = async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error(`fail ${callCount}`);
        }
        return 'success';
      };

      const result = await withRetry(operation, { maxRetries: 3, delay: 10 });

      expect(result).to.equal('success');
      expect(callCount).to.equal(3);
    });

    it('should throw after max retries', async () => {
      let callCount = 0;
      const operation = async () => {
        callCount++;
        throw new Error('always fails');
      };

      try {
        await withRetry(operation, { maxRetries: 2, delay: 10 });
        expect.fail('Should have thrown');
      } catch (e) {
        expect((e as Error).message).to.equal('always fails');
      }

      expect(callCount).to.equal(2); // maxRetries=2 total attempts
    });
  });
});
