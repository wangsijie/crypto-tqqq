/**
 * Test script for logger functionality
 */

import { LoggerService } from './services/logger';
import { TradeLog } from './types';

async function testLogger() {
  console.log('🧪 Testing Logger Service...\n');

  const logger = new LoggerService('./logs');

  // Test 1: Log a successful buy trade
  console.log('Test 1: Logging successful BUY trade...');
  const buyLog: TradeLog = {
    timestamp: new Date().toISOString(),
    ethPrice: 2100.50,
    accountEquity: 12000,
    currentPosition: 15,
    targetPosition: 17.14,
    delta: 2.14,
    action: 'buy',
    orderSize: 2.14,
    orderId: 'test-order-123',
    success: true,
  };
  await logger.logTrade(buyLog);

  // Test 2: Log a successful sell trade
  console.log('\nTest 2: Logging successful SELL trade...');
  const sellLog: TradeLog = {
    timestamp: new Date().toISOString(),
    ethPrice: 2200.00,
    accountEquity: 12500,
    currentPosition: 17.14,
    targetPosition: 17.05,
    delta: -0.09,
    action: 'hold', // Below threshold
    success: true,
  };
  await logger.logTrade(sellLog);

  // Test 3: Log a failed trade
  console.log('\nTest 3: Logging failed trade...');
  const failedLog: TradeLog = {
    timestamp: new Date().toISOString(),
    ethPrice: 2150.00,
    accountEquity: 12300,
    currentPosition: 17.14,
    targetPosition: 17.16,
    delta: 0.02,
    action: 'buy',
    orderSize: 0.02,
    success: false,
    error: 'API Error: Insufficient margin',
  };
  await logger.logTrade(failedLog);

  // Test 4: Get all logs for today
  console.log('\nTest 4: Retrieving today\'s logs...');
  const todayLogs = await logger.getLogs();
  console.log(`Found ${todayLogs.length} logs for today`);

  // Test 5: Get daily summary
  console.log('\nTest 5: Getting daily summary...');
  const summary = await logger.getDailySummary();
  console.log('Daily Summary:', summary);

  console.log('\n✅ Logger tests completed successfully!');
  console.log(`Check the logs directory for the generated log files.`);
}

// Main execution
if (require.main === module) {
  testLogger().catch(console.error);
}