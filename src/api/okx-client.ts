/**
 * OKX API Client
 * Handles authentication and API requests to OKX exchange
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';
import { OKXConfig, AccountBalance, TickerData, Position, OrderRequest, OrderResponse, InstrumentInfo } from '../types';

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
   * This includes both balance and positions
   */
  async getAccountEquity(): Promise<number> {
    const response = await this.client.get('/api/v5/account/balance');
    
    if (response.data.code !== '0') {
      throw new Error(`OKX API Error: ${response.data.msg}`);
    }

    const accountData = response.data.data[0];
    if (!accountData || !accountData.totalEq) {
      throw new Error('Account equity not found');
    }

    return parseFloat(accountData.totalEq);
  }

  /**
   * Get current position size for a specific instrument in base currency amount
   * For perpetual swaps, this converts contracts to actual base currency amount
   */
  async getPosition(instId: string): Promise<number> {
    const positions = await this.getPositions(instId);
    
    if (positions.length === 0) {
      return 0;
    }

    const position = positions.find(p => p.instId === instId && p.posSide === 'long');
    if (!position) {
      return 0;
    }

    const contractsHeld = parseFloat(position.pos);
    
    // For perpetual swaps, we need to convert contracts to base currency amount
    if (position.instType === 'SWAP') {
      try {
        const instrumentInfo = await this.getInstrument(instId);
        const contractValue = parseFloat(instrumentInfo.ctVal);
        
        // Contract value represents how much of the base currency each contract is worth
        // For DOGE-USDT-SWAP: ctVal = 1000 means 1 contract = 1000 DOGE
        return contractsHeld * contractValue;
      } catch (error) {
        console.error(`Error fetching instrument info for ${instId}:`, error);
        // Fallback to raw contract count if we can't get instrument info
        return contractsHeld;
      }
    }
    
    // For spot trading, position.pos should already be in base currency
    return contractsHeld;
  }

  /**
   * Get raw contract count for debugging purposes
   * Returns the actual number of contracts held (not converted to base currency)
   */
  async getPositionContracts(instId: string): Promise<number> {
    const positions = await this.getPositions(instId);
    
    if (positions.length === 0) {
      return 0;
    }

    const position = positions.find(p => p.instId === instId && p.posSide === 'long');
    return position ? parseFloat(position.pos) : 0;
  }

  /**
   * Get current price for a specific instrument
   */
  async getPrice(instId: string): Promise<number> {
    const ticker = await this.getTicker(instId);
    return parseFloat(ticker.last);
  }

  /**
   * Get instrument specifications including contract details
   * This is a public endpoint that doesn't require authentication
   */
  async getInstrument(instId: string, instType: string = 'SWAP'): Promise<InstrumentInfo> {
    // Use axios directly for public endpoint (no auth required)
    const response = await axios.get(
      `https://www.okx.com/api/v5/public/instruments?instType=${instType}&instId=${instId}`
    );
    
    if (response.data.code !== '0') {
      throw new Error(`OKX API Error: ${response.data.msg}`);
    }

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error(`Instrument ${instId} not found`);
    }

    return response.data.data[0];
  }
}