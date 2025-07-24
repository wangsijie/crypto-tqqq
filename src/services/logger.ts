/**
 * Transaction logger service for recording all rebalancing activities
 */

import fs from 'fs/promises';
import path from 'path';
import { TradeLog } from '../types';

export class LoggerService {
  private logDir: string;
  private logFile: string;

  constructor(logDir: string = './logs') {
    this.logDir = logDir;
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(this.logDir, `trades-${date}.json`);
  }

  /**
   * Initialize logger and ensure log directory exists
   */
  async initialize(): Promise<void> {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  /**
   * Log a trade action to file
   */
  async logTrade(tradeLog: TradeLog): Promise<void> {
    await this.initialize();
    
    try {
      // Read existing logs or create empty array
      let logs: TradeLog[] = [];
      try {
        const existingData = await fs.readFile(this.logFile, 'utf-8');
        logs = JSON.parse(existingData);
      } catch {
        // File doesn't exist yet, start with empty array
      }

      // Append new log
      logs.push(tradeLog);

      // Write back to file
      await fs.writeFile(
        this.logFile,
        JSON.stringify(logs, null, 2),
        'utf-8'
      );

      // Also log to console for immediate feedback
      this.printLog(tradeLog);
    } catch (error) {
      console.error('Failed to write log:', error);
      throw error;
    }
  }

  /**
   * Get all logs from a specific date
   */
  async getLogs(date?: string): Promise<TradeLog[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const targetFile = path.join(this.logDir, `trades-${targetDate}.json`);

    try {
      const data = await fs.readFile(targetFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Print formatted log to console
   */
  private printLog(log: TradeLog): void {
    const emoji = log.success ? '✅' : '❌';
    const action = log.action === 'hold' ? 'HOLD' : `${log.action.toUpperCase()} ${log.orderSize?.toFixed(4) || 0} ETH`;
    
    console.log(`\n${emoji} Trade Log - ${log.timestamp}`);
    console.log('─'.repeat(50));
    console.log(`  ETH Price: $${log.ethPrice.toFixed(2)}`);
    console.log(`  Account Equity: $${log.accountEquity.toFixed(2)}`);
    console.log(`  Current Position: ${log.currentPosition.toFixed(4)} ETH`);
    console.log(`  Target Position: ${log.targetPosition.toFixed(4)} ETH`);
    console.log(`  Delta: ${log.delta >= 0 ? '+' : ''}${log.delta.toFixed(4)} ETH`);
    console.log(`  Action: ${action}`);
    
    if (log.orderId) {
      console.log(`  Order ID: ${log.orderId}`);
    }
    
    if (log.error) {
      console.log(`  Error: ${log.error}`);
    }
    
    console.log('─'.repeat(50));
  }

  /**
   * Generate daily summary report
   */
  async getDailySummary(date?: string): Promise<{
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    totalBought: number;
    totalSold: number;
    averageEquity: number;
  }> {
    const logs = await this.getLogs(date);
    
    const summary = {
      totalTrades: logs.length,
      successfulTrades: logs.filter(l => l.success).length,
      failedTrades: logs.filter(l => !l.success).length,
      totalBought: 0,
      totalSold: 0,
      averageEquity: 0,
    };

    let totalEquity = 0;
    
    for (const log of logs) {
      if (log.success && log.orderSize) {
        if (log.action === 'buy') {
          summary.totalBought += log.orderSize;
        } else if (log.action === 'sell') {
          summary.totalSold += log.orderSize;
        }
      }
      totalEquity += log.accountEquity;
    }

    summary.averageEquity = logs.length > 0 ? totalEquity / logs.length : 0;

    return summary;
  }
}