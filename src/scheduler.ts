/**
 * Scheduler for automated daily rebalancing
 * Runs continuously and checks time periodically for Docker environments
 */

import { OKXClient } from './api';
import { StrategyService, LoggerService } from './services';
import config from './config';

const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
let lastExecutionDate: string | null = null;

function parseSchedule(cronSchedule: string): { hour: number; minute: number } {
  // Parse simple cron format: "minute hour * * *"
  const parts = cronSchedule.split(' ');
  if (parts.length !== 5) {
    throw new Error(`Invalid cron format: ${cronSchedule}. Expected: "minute hour * * *"`);
  }
  
  const minute = parseInt(parts[0]);
  const hour = parseInt(parts[1]);
  
  if (isNaN(minute) || isNaN(hour) || minute < 0 || minute > 59 || hour < 0 || hour > 23) {
    throw new Error(`Invalid time in cron schedule: ${cronSchedule}`);
  }
  
  return { hour, minute };
}

function shouldExecuteNow(targetHour: number, targetMinute: number): boolean {
  const now = new Date();
  const todayKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Don't execute if we already ran today
  if (lastExecutionDate === todayKey) {
    console.log(`🚫 Already executed today (${todayKey}), skipping...`);
    return false;
  }
  
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  
  // Check if current time matches or passed the target time
  if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
    console.log(`✅ Execution time reached: ${currentHour}:${currentMinute.toString().padStart(2, '0')} >= ${targetHour}:${targetMinute.toString().padStart(2, '0')}`);
    return true;
  }
  
  return false;
}

async function runRebalancing(): Promise<void> {
  console.log(`🕐 Scheduled rebalancing started at ${new Date().toISOString()}`);
  
  try {
    // Initialize services and run rebalancing directly
    const okxClient = new OKXClient(config.okx);
    const logger = new LoggerService();
    const strategy = new StrategyService(okxClient, logger);

    const result = await strategy.executeRebalancing();
    
    if (result.success) {
      console.log('✅ Scheduled rebalancing completed successfully!');
      if (result.tradeLog.action !== 'hold') {
        const actionEmoji = result.tradeLog.action === 'buy' ? '📈' : '📉';
        console.log(`${actionEmoji} Action: ${result.tradeLog.action.toUpperCase()} ${result.tradeLog.orderSize?.toFixed(4)} ${config.trading.symbol}`);
      } else {
        console.log('⏸️ No action needed - position within target range');
      }
    } else {
      console.error('❌ Scheduled rebalancing failed:', result.error);
    }
    
    // Mark today as executed
    lastExecutionDate = new Date().toISOString().split('T')[0];
    
  } catch (error) {
    console.error(`💥 Scheduled rebalancing failed at ${new Date().toISOString()}:`, error);
    
    // In production, you might want to send alerts here
    // For example: send email, Slack notification, etc.
  }
}

function getNextExecutionTime(targetHour: number, targetMinute: number): Date {
  const now = new Date();
  const next = new Date();
  next.setUTCHours(targetHour, targetMinute, 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  
  return next;
}

async function startScheduler(): Promise<void> {
  console.log('🚀 Starting crypto rebalancing scheduler...');
  console.log(`🎯 Target: ${config.trading.symbol} ${config.trading.leverageMultiplier}x leverage`);
  console.log(`🧪 Mode: ${config.trading.dryRun ? 'DRY RUN (Safe)' : 'LIVE TRADING'}`);
  
  const { hour, minute } = parseSchedule(config.scheduler.cronSchedule);
  const nextExecution = getNextExecutionTime(hour, minute);
  
  // If we're starting after today's execution time, mark today as already executed
  const now = new Date();
  const todayKey = now.toISOString().split('T')[0];
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  
  if (currentHour > hour || (currentHour === hour && currentMinute >= minute)) {
    console.log(`⚠️ Current time (${currentHour}:${currentMinute.toString().padStart(2, '0')}) is past today's execution time (${hour}:${minute.toString().padStart(2, '0')})`);
    console.log(`📅 Marking today (${todayKey}) as already executed to prevent immediate execution`);
    lastExecutionDate = todayKey;
  }
  
  console.log(`📅 Daily execution time: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} UTC`);
  console.log(`🕐 Current time: ${new Date().toISOString()}`);
  console.log(`⏳ Next execution: ${nextExecution.toISOString()}`);
  
  const timeUntilNext = nextExecution.getTime() - new Date().getTime();
  const hoursUntil = Math.floor(timeUntilNext / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
  console.log(`⏰ Time remaining: ${hoursUntil}h ${minutesUntil}m`);
  
  console.log(`🔄 Checking every ${CHECK_INTERVAL_MS / 1000} seconds`);
  console.log('─'.repeat(60));

  // Main scheduler loop
  const intervalId = setInterval(async () => {
    try {
      if (shouldExecuteNow(hour, minute)) {
        await runRebalancing();
        
        // Calculate next execution time
        const nextExecution = getNextExecutionTime(hour, minute);
        console.log(`⏳ Next execution scheduled for: ${nextExecution.toISOString()}`);
      } else {
        // Show periodic status updates
        const now = new Date();
        const nextExecution = getNextExecutionTime(hour, minute);
        const timeUntilNext = nextExecution.getTime() - now.getTime();
        const hoursUntil = Math.floor(timeUntilNext / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
        
        // Log status every 15 minutes or show debug info if frequently executing
        const currentMinute = now.getUTCMinutes();
        if (currentMinute % 15 === 0 && now.getUTCSeconds() < 60) {
          console.log(`⏰ Status: Waiting for execution time (${hoursUntil}h ${minutesUntil}m remaining) - Current: ${now.toISOString()}`);
          console.log(`🔍 Debug: lastExecutionDate=${lastExecutionDate}, today=${now.toISOString().split('T')[0]}`);
        }
      }
    } catch (error) {
      console.error('💥 Error in scheduler loop:', error);
    }
  }, CHECK_INTERVAL_MS);

  console.log('⏰ Scheduler started successfully!');
  console.log('📡 Waiting for scheduled execution time...');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️ Received SIGINT, stopping scheduler...');
    clearInterval(intervalId);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n⚠️ Received SIGTERM, stopping scheduler...');
    clearInterval(intervalId);
    process.exit(0);
  });
}

if (require.main === module) {
  startScheduler().catch((error) => {
    console.error('💥 Failed to start scheduler:', error);
    process.exit(1);
  });
}