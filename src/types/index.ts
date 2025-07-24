/**
 * TypeScript type definitions for OKX API and trading operations
 */

export interface OKXConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
}

export interface AccountBalance {
  eq: string;
  availEq: string;
  ccy: string;
  upl: string;
  isoEq: string;
  cashBal: string;
  frozenBal: string;
}

export interface TickerData {
  instId: string;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  vol24h: string;
  ts: string;
}

export interface Position {
  instId: string;
  instType: string;
  pos: string;
  posSide: string;
  avgPx: string;
  upl: string;
  uplRatio: string;
  notionalUsd: string;
  adl: string;
  margin: string;
  imr: string;
  mmr: string;
  lever: string;
  liqPx: string;
  markPx: string;
  mgnMode: string;
  mgnRatio: string;
  posId: string;
  posCcy: string;
  tradeId: string;
  last: string;
  uTime: string;
  cTime: string;
}

export interface OrderRequest {
  instId: string;
  tdMode: 'isolated' | 'cross' | 'cash';
  side: 'buy' | 'sell';
  ordType: 'market' | 'limit' | 'post_only' | 'fok' | 'ioc';
  sz: string;
  px?: string;
  posSide?: 'long' | 'short' | 'net';
  ccy?: string;
}

export interface OrderResponse {
  ordId: string;
  clOrdId: string;
  tag: string;
  sCode: string;
  sMsg: string;
}

export interface TradeLog {
  timestamp: string;
  ethPrice: number;
  accountEquity: number;
  currentPosition: number;
  targetPosition: number;
  delta: number;
  action: 'buy' | 'sell' | 'hold';
  orderSize?: number;
  orderId?: string;
  success: boolean;
  error?: string;
}

export interface RebalanceResult {
  success: boolean;
  tradeLog: TradeLog;
  error?: string;
}