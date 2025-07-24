/**
 * Telegram Notification Service
 * Handles sending messages to Telegram chat for dry-run notifications
 */

import TelegramBot from 'node-telegram-bot-api';
import config from '../config';
import { TradeLog } from '../types';

export class TelegramService {
  private bot?: TelegramBot;
  private chatId?: string;
  private enabled: boolean;

  constructor() {
    this.enabled = config.telegram.enabled;
    
    if (this.enabled && config.telegram.botToken && config.telegram.chatId) {
      this.bot = new TelegramBot(config.telegram.botToken, { polling: false });
      this.chatId = config.telegram.chatId;
    }
  }

  /**
   * Send a dry-run notification to Telegram
   */
  async sendDryRunNotification(tradeLog: TradeLog): Promise<void> {
    if (!this.enabled || !this.bot || !this.chatId) {
      return;
    }

    try {
      const message = this.formatDryRunMessage(tradeLog);
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }

  /**
   * Send a general notification to Telegram
   */
  async sendNotification(message: string): Promise<void> {
    if (!this.enabled || !this.bot || !this.chatId) {
      return;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }

  /**
   * Format dry-run trade log into a readable Telegram message
   */
  private formatDryRunMessage(tradeLog: TradeLog): string {
    const symbol = config.trading.symbol;
    const actionEmoji = tradeLog.action === 'buy' ? '📈' : tradeLog.action === 'sell' ? '📉' : '⏸️';
    const statusEmoji = tradeLog.success ? '✅' : '❌';
    
    let message = `🧪 <b>DRY RUN - Crypto 3x Strategy</b>\n\n`;
    message += `${statusEmoji} <b>Status:</b> ${tradeLog.success ? 'Success' : 'Failed'}\n`;
    message += `📊 <b>Asset:</b> ${symbol}\n`;
    message += `💰 <b>Price:</b> $${tradeLog.assetPrice.toFixed(4)}\n`;
    message += `💼 <b>Equity:</b> $${tradeLog.accountEquity.toFixed(2)}\n\n`;
    
    message += `📍 <b>Positions:</b>\n`;
    message += `   Current: ${tradeLog.currentPosition.toFixed(4)} ${symbol}\n`;
    message += `   Target: ${tradeLog.targetPosition.toFixed(4)} ${symbol}\n`;
    message += `   Delta: ${tradeLog.delta >= 0 ? '+' : ''}${tradeLog.delta.toFixed(4)} ${symbol}\n\n`;
    
    if (tradeLog.action !== 'hold' && tradeLog.orderSize) {
      message += `${actionEmoji} <b>Would Execute:</b>\n`;
      message += `   Action: ${tradeLog.action.toUpperCase()}\n`;
      message += `   Size: ${tradeLog.orderSize.toFixed(4)} ${symbol}\n`;
      if (tradeLog.orderId) {
        message += `   Order ID: ${tradeLog.orderId}\n`;
      }
    } else {
      message += `⏸️ <b>No Action Needed</b>\n`;
      message += `   Position within target range\n`;
    }
    
    if (tradeLog.error) {
      message += `\n❌ <b>Error:</b> ${tradeLog.error}`;
    }
    
    message += `\n⏰ <b>Time:</b> ${new Date(tradeLog.timestamp).toLocaleString()}`;
    
    return message;
  }

  /**
   * Check if Telegram service is properly configured
   */
  isConfigured(): boolean {
    return this.enabled && !!this.bot && !!this.chatId;
  }
}