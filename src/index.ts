/**
 * Crypto 3x Leverage Strategy - Main Entry Point
 * Automated rebalancing tool for cryptocurrency perpetual contracts
 */

import { OKXClient } from './api';
import { StrategyService, LoggerService } from './services';
import config from './config';

async function main() {
  console.log(`🚀 ${config.trading.symbol} 3x Leverage Strategy Started`);
  console.log(`📊 Target: ${config.trading.leverageMultiplier}x leverage on ${config.trading.instrument}`);
  console.log(`⚡ Min adjustment: ${config.trading.minAdjustmentSize} ${config.trading.symbol}`);
  console.log(`🧪 Mode: ${config.trading.dryRun ? 'DRY RUN (Safe)' : 'LIVE TRADING'}`);
  console.log('─'.repeat(60));

  try {
    // Initialize services
    const okxClient = new OKXClient(config.okx);
    const logger = new LoggerService();
    const strategy = new StrategyService(okxClient, logger);

    // Execute rebalancing
    console.log('🔄 Starting rebalancing process...');
    const result = await strategy.executeRebalancing();

    // Display results summary
    console.log('\n📊 Rebalancing Summary:');
    console.log(`  ${config.trading.symbol} Price: $${result.tradeLog.assetPrice.toFixed(4)}`);
    console.log(`  Account Equity: $${result.tradeLog.accountEquity.toFixed(2)}`);
    console.log(`  Current Position: ${result.tradeLog.currentPosition.toFixed(4)} ${config.trading.symbol}`);
    console.log(`  Target Position: ${result.tradeLog.targetPosition.toFixed(4)} ${config.trading.symbol}`);
    console.log(`  Delta: ${result.tradeLog.delta >= 0 ? '+' : ''}${result.tradeLog.delta.toFixed(4)} ${config.trading.symbol}`);

    if (result.success) {
      console.log('\n✅ Rebalancing completed successfully!');
      
      if (result.tradeLog.action !== 'hold') {
        const actionEmoji = result.tradeLog.action === 'buy' ? '📈' : '📉';
        console.log(`${actionEmoji} Action: ${result.tradeLog.action.toUpperCase()} ${result.tradeLog.orderSize?.toFixed(4)} ${config.trading.symbol}`);
        if (result.tradeLog.orderId) {
          console.log(`🔗 Order ID: ${result.tradeLog.orderId}`);
        }
      } else {
        console.log('⏸️ No action needed - position within target range');
      }
    } else {
      console.log('\n❌ Rebalancing failed!');
      if (result.error) {
        console.error(`Error: ${result.error}`);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error during rebalancing:', error);
    process.exit(1);
  }

  console.log('─'.repeat(60));
  console.log('🏁 Rebalancing process completed');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}