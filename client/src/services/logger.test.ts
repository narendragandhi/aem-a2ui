import { expect } from '@open-wc/testing';
import { logger, apiLogger, uiLogger } from './logger.js';

describe('Logger Service', () => {
  beforeEach(() => {
    // Configure logger for testing
    logger.configure({ enabled: true, minLevel: 'debug' });
    logger.clearLogs();
  });

  it('should store logs in memory', () => {
    logger.info('Test message');
    const logs = logger.getLogs();
    expect(logs.length).to.equal(1);
    expect(logs[0].message).to.equal('Test message');
    expect(logs[0].level).to.equal('info');
  });

  it('should clear logs', () => {
    logger.info('Test message');
    logger.clearLogs();
    expect(logger.getLogs().length).to.equal(0);
  });

  it('should respect minLevel configuration', () => {
    logger.configure({ minLevel: 'warn' });
    logger.clearLogs();

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    const logs = logger.getLogs();
    // Only warn and error should be logged
    expect(logs.length).to.equal(2);
    expect(logs[0].level).to.equal('warn');
    expect(logs[1].level).to.equal('error');
  });

  it('should not log when disabled', () => {
    logger.configure({ enabled: false });
    logger.clearLogs();

    logger.info('Should not log');

    expect(logger.getLogs().length).to.equal(0);
  });

  it('should include context in logs', () => {
    logger.info('Test message', 'TestContext');
    const logs = logger.getLogs();
    expect(logs[0].context).to.equal('TestContext');
  });

  it('should include data in logs', () => {
    const testData = { foo: 'bar' };
    logger.info('Test message', 'Context', testData);
    const logs = logger.getLogs();
    expect(logs[0].data).to.deep.equal(testData);
  });

  describe('Scoped Loggers', () => {
    it('should create scoped logger for API', () => {
      apiLogger.info('API call');
      const logs = logger.getLogs();
      expect(logs[0].context).to.equal('API');
    });

    it('should create scoped logger for UI', () => {
      uiLogger.info('UI event');
      const logs = logger.getLogs();
      expect(logs[0].context).to.equal('UI');
    });
  });
});
