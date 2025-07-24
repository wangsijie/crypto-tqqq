/**
 * OKX API Client
 * Handles authentication and API requests to OKX exchange
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { OKXConfig, AccountBalance, TickerData, Position, OrderRequest, OrderResponse } from '../types';

export class OKXClient {
  private client: AxiosInstance;
  private config: OKXConfig;

  constructor(config: OKXConfig) {
    this.config = config;
    
    const baseURL = 'https://www.okx.com';

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': this.config.apiKey,
        'OK-ACCESS-PASSPHRASE': this.config.passphrase,
      },
    });

    this.client.interceptors.request.use(this.signRequest.bind(this));
  }

  private signRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const timestamp = new Date().toISOString();
    const method = config.method?.toUpperCase() || 'GET';
    const requestPath = config.url || '';
    const body = config.data ? JSON.stringify(config.data) : '';
    
    const prehashString = timestamp + method + requestPath + body;
    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(prehashString)
      .digest('base64');

    config.headers['OK-ACCESS-SIGN'] = signature;
    config.headers['OK-ACCESS-TIMESTAMP'] = timestamp;

    return config;
  }

  /**
   * Get account balance and equity
   */
  async getAccountBalance(): Promise<AccountBalance[]> {
    const response = await this.client.get('/api/v5/account/balance');
    
    if (response.data.code !== '0') {
      throw new Error(`OKX API Error: ${response.data.msg}`);
    }

    return response.data.data[0].details;
  }

  /**
   * Get ticker data for a specific instrument
   */
  async getTicker(instId: string): Promise<TickerData> {
    const response = await this.client.get(`/api/v5/market/ticker?instId=${instId}`);
    
    if (response.data.code !== '0') {
      throw new Error(`OKX API Error: ${response.data.msg}`);
    }

    return response.data.data[0];
  }

  /**
   * Get current positions
   */
  async getPositions(instId?: string): Promise<Position[]> {
    const url = instId 
      ? `/api/v5/account/positions?instId=${instId}`
      : '/api/v5/account/positions';
    
    const response = await this.client.get(url);
    
    if (response.data.code !== '0') {
      throw new Error(`OKX API Error: ${response.data.msg}`);
    }

    return response.data.data;
  }

  /**
   * Place a market order
   */
  async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    const response = await this.client.post('/api/v5/trade/order', orderRequest);
    
    if (response.data.code !== '0') {
      throw new Error(`OKX API Error: ${response.data.msg}`);
    }

    return response.data.data[0];
  }

  /**
   * Get account equity (total net worth including unrealized PnL)
   */
  async getAccountEquity(): Promise<number> {
    const balances = await this.getAccountBalance();
    const usdtBalance = balances.find(b => b.currency === 'USDT');
    
    if (!usdtBalance) {
      throw new Error('USDT balance not found');
    }

    return parseFloat(usdtBalance.totalEq);
  }

  /**
   * Get current ETH perpetual position size
   */
  async getETHPosition(): Promise<number> {
    const positions = await this.getPositions('ETH-USDT-SWAP');
    
    if (positions.length === 0) {
      return 0;
    }

    const ethPosition = positions.find(p => p.instId === 'ETH-USDT-SWAP' && p.posSide === 'long');
    return ethPosition ? parseFloat(ethPosition.pos) : 0;
  }

  /**
   * Get current ETH/USDT perpetual contract price
   */
  async getETHPrice(): Promise<number> {
    const ticker = await this.getTicker('ETH-USDT-SWAP');
    return parseFloat(ticker.last);
  }
}