/**
 * ETH 3x Leverage Strategy Service
 * Core business logic for position calculations and rebalancing decisions
 */

import { OKXClient } from '../api';
import { TradeLog, RebalanceResult } from '../types';
import { LoggerService } from './logger';
import config from '../config';

export class StrategyService {
  private okxClient: OKXClient;
  private logger: LoggerService;

  constructor(okxClient: OKXClient, logger?: LoggerService) {
    this.okxClient = okxClient;
    this.logger = logger || new LoggerService();
  }

  /**
   * Calculate target position based on current equity and leverage multiplier
   * Formula: Target Position = Current Equity (USDT) × Leverage ÷ Asset Price (USDT)
   */
  calculateTargetPosition(equity: number, assetPrice: number): number {
    const targetPosition = (equity * config.trading.leverageMultiplier) / assetPrice;
    return Math.round(targetPosition * 10000) / 10000; // Round to 4 decimal places
  }

  /**
   * Calculate position delta and determine if adjustment is needed
   * Returns positive value for buy (increase position), negative for sell (decrease position)
   */
  calculatePositionDelta(currentPosition: number, targetPosition: number): {
    delta: number;
    needsAdjustment: boolean;
    action: 'buy' | 'sell' | 'hold';
  } {
    const delta = targetPosition - currentPosition;
    const absDelta = Math.abs(delta);
    const needsAdjustment = absDelta >= config.trading.minAdjustmentSize;

    let action: 'buy' | 'sell' | 'hold';
    if (!needsAdjustment) {
      action = 'hold';
    } else if (delta > 0) {
      action = 'buy';
    } else {
      action = 'sell';
    }

    return {
      delta: Math.round(delta * 10000) / 10000, // Round to 4 decimal places
      needsAdjustment,
      action,
    };
  }

  /**
   * Execute position adjustment by placing market order
   */
  async executePositionAdjustment(
    action: 'buy' | 'sell',
    orderSize: number
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const orderRequest = {
        instId: config.trading.instrument,
        tdMode: 'isolated' as const,
        side: action,
        ordType: 'market' as const,
        sz: orderSize.toString(),
        posSide: 'long' as const,
      };

      const orderResponse = await this.okxClient.placeOrder(orderRequest);
      
      return {
        success: true,
        orderId: orderResponse.ordId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Create trade log entry
   */
  createTradeLog(
    assetPrice: number,
    accountEquity: number,
    currentPosition: number,
    targetPosition: number,
    delta: number,
    action: 'buy' | 'sell' | 'hold',
    orderSize?: number,
    orderId?: string,
    success?: boolean,
    error?: string
  ): TradeLog {
    return {
      timestamp: new Date().toISOString(),
      assetPrice,
      accountEquity,
      currentPosition,
      targetPosition,
      delta,
      action,
      orderSize,
      orderId,
      success: success ?? true,
      error,
    };
  }

  /**
   * Execute complete rebalancing strategy
   */
  async executeRebalancing(): Promise<RebalanceResult> {
    try {
      // Step 1: Get current market data
      const [accountEquity, assetPrice, currentPosition] = await Promise.all([
        this.okxClient.getAccountEquity(),
        this.okxClient.getPrice(config.trading.instrument),
        this.okxClient.getPosition(config.trading.instrument),
      ]);

      // Step 2: Calculate target position and delta
      const targetPosition = this.calculateTargetPosition(accountEquity, assetPrice);
      const { delta, needsAdjustment, action } = this.calculatePositionDelta(
        currentPosition,
        targetPosition
      );

      // Step 3: Execute trade if adjustment is needed
      let orderResult: { success: boolean; orderId?: string; error?: string } = {
        success: true,
      };
      
      if (needsAdjustment && action !== 'hold') {
        const orderSize = Math.abs(delta);
        orderResult = await this.executePositionAdjustment(action, orderSize);
      }

      // Step 4: Create trade log
      const tradeLog = this.createTradeLog(
        assetPrice,
        accountEquity,
        currentPosition,
        targetPosition,
        delta,
        action,
        needsAdjustment ? Math.abs(delta) : undefined,
        orderResult.orderId,
        orderResult.success,
        orderResult.error
      );

      // Step 5: Log the trade
      await this.logger.logTrade(tradeLog);

      return {
        success: orderResult.success,
        tradeLog,
        error: orderResult.error,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Create error trade log
      const tradeLog = this.createTradeLog(
        0, 0, 0, 0, 0, 'hold',
        undefined, undefined, false, errorMessage
      );

      // Log the error
      await this.logger.logTrade(tradeLog);

      return {
        success: false,
        tradeLog,
        error: errorMessage,
      };
    }
  }
}