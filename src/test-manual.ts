/**
 * Manual testing script for OKX API integration
 * Run with: npm run dev -- test-manual.ts
 */

import { OKXClient } from './api';
import { StrategyService, LoggerService } from './services';
import config from './config';

async function testOKXConnection() {
  console.log('🔧 Testing OKX API Connection...\n');
  
  try {
    const okxClient = new OKXClient(config.okx);
    
    // Test 1: Get account equity
    console.log('📊 Getting account equity...');
    const equity = await okxClient.getAccountEquity();
    console.log(`Account Equity: ${equity} USDT\n`);
    
    // Test 2: Get asset price
    console.log(`💰 Getting ${config.trading.symbol} price...`);
    const assetPrice = await okxClient.getPrice(config.trading.instrument);
    console.log(`${config.trading.symbol} Price: ${assetPrice} USDT\n`);
    
    // Test 3: Get current position
    console.log(`📈 Getting ${config.trading.symbol} position...`);
    const position = await okxClient.getPosition(config.trading.instrument);
    console.log(`Current ${config.trading.symbol} Position: ${position} ${config.trading.symbol}\n`);
    
    // Test 4: Get all positions (detailed)
    console.log('📋 Getting all positions...');
    const allPositions = await okxClient.getPositions();
    console.log('All Positions:');
    allPositions.forEach(pos => {
      console.log(`  ${pos.instId}: ${pos.pos} (${pos.posSide}), PnL: ${pos.upl} USDT`);
    });
    console.log();
    
    // Test 5: Calculate target position using strategy
    console.log('🎯 Calculating target position...');
    const strategy = new StrategyService(okxClient);
    const targetPosition = strategy.calculateTargetPosition(equity, assetPrice);
    const { delta, needsAdjustment, action } = strategy.calculatePositionDelta(position, targetPosition);
    
    console.log(`Target Position: ${targetPosition} ${config.trading.symbol}`);
    console.log(`Current Position: ${position} ${config.trading.symbol}`);
    console.log(`Delta: ${delta} ${config.trading.symbol}`);
    console.log(`Needs Adjustment: ${needsAdjustment}`);
    console.log(`Action: ${action}\n`);
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

async function testAccountBalance() {
  console.log('💳 Testing detailed account balance and positions...\n');
  
  try {
    const okxClient = new OKXClient(config.okx);
    
    // Get total equity
    const equity = await okxClient.getAccountEquity();
    console.log(`📊 Total Account Equity: ${equity} USDT\n`);
    
    // Get detailed balances
    const balances = await okxClient.getAccountBalance();
    console.log('💰 Currency Balances:');
    balances.forEach(balance => {
      if (parseFloat(balance.eq) > 0) {
        console.log(`  ${balance.ccy}: ${balance.eq} (Available: ${balance.availEq}, UPL: ${balance.upl || '0'})`);
      }
    });
    console.log();
    
    // Get all positions
    const positions = await okxClient.getPositions();
    console.log(`📈 Active Positions (${positions.length} total):`);
    if (positions.length === 0) {
      console.log('  No active positions');
    } else {
      positions.forEach(pos => {
        const size = parseFloat(pos.pos);
        const avgPrice = parseFloat(pos.avgPx);
        const markPrice = parseFloat(pos.markPx);
        const upl = parseFloat(pos.upl);
        const uplPercentage = parseFloat(pos.uplRatio) * 100;
        
        console.log(`\n  ${pos.instId}:`);
        console.log(`    Position: ${size} contracts (${pos.posSide})`);
        console.log(`    Avg Entry: ${avgPrice} USDT`);
        console.log(`    Mark Price: ${markPrice} USDT`);
        console.log(`    Unrealized PnL: ${upl.toFixed(2)} USDT (${uplPercentage.toFixed(2)}%)`);
        console.log(`    Notional: ${parseFloat(pos.notionalUsd).toFixed(2)} USD`);
        console.log(`    Leverage: ${pos.lever}x`);
        console.log(`    Margin: ${parseFloat(pos.margin).toFixed(2)} USDT`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting account details:', error);
  }
}

async function testFullRebalancing() {
  console.log('🔄 Testing full rebalancing logic (DRY RUN - no actual trades)...\n');
  
  try {
    const okxClient = new OKXClient(config.okx);
    const logger = new LoggerService();
    const strategy = new StrategyService(okxClient, logger);
    
    // Get current data
    const [equity, assetPrice, position] = await Promise.all([
      okxClient.getAccountEquity(),
      okxClient.getPrice(config.trading.instrument),
      okxClient.getPosition(config.trading.instrument),
    ]);
    
    // Calculate what would happen
    const targetPosition = strategy.calculateTargetPosition(equity, assetPrice);
    const { delta, needsAdjustment, action } = strategy.calculatePositionDelta(position, targetPosition);
    
    console.log('📊 Current Market Data:');
    console.log(`  Account Equity: ${equity} USDT`);
    console.log(`  ${config.trading.symbol} Price: ${assetPrice} USDT`);
    console.log(`  Current Position: ${position} ${config.trading.symbol}`);
    console.log();
    
    console.log('🎯 Rebalancing Analysis:');
    console.log(`  Target Position: ${targetPosition} ${config.trading.symbol}`);
    console.log(`  Delta: ${delta} ${config.trading.symbol}`);
    console.log(`  Action Required: ${action}`);
    console.log(`  Needs Adjustment: ${needsAdjustment}`);
    
    if (needsAdjustment && action !== 'hold') {
      console.log(`  📋 Would execute: ${action.toUpperCase()} ${Math.abs(delta)} ${config.trading.symbol}`);
    } else {
      console.log('  ⏸️ No action needed (within threshold)');
    }
    
    // Log the dry run
    const tradeLog = strategy.createTradeLog(
      assetPrice,
      equity,
      position,
      targetPosition,
      delta,
      action,
      needsAdjustment ? Math.abs(delta) : undefined,
      undefined,
      true,
      undefined
    );
    await logger.logTrade(tradeLog);
    
    console.log('\n📝 Trade logged to file system');
    
  } catch (error) {
    console.error('❌ Error during rebalancing test:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'connection';
  
  switch (command) {
    case 'connection':
      await testOKXConnection();
      break;
    case 'balance':
      await testAccountBalance();
      break;
    case 'rebalance':
      await testFullRebalancing();
      break;
    default:
      console.log('Available commands:');
      console.log('  npm run dev src/test-manual.ts connection  - Test API connection and basic data');
      console.log('  npm run dev src/test-manual.ts balance     - Test account balance details');
      console.log('  npm run dev src/test-manual.ts rebalance   - Test full rebalancing logic (dry run)');
      console.log('  npm run dev src/test-logger.ts            - Test logger functionality');
  }
}

if (require.main === module) {
  main().catch(console.error);
}