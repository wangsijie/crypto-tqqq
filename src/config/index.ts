/**
 * Configuration module for API credentials and trading parameters
 */

import dotenv from 'dotenv';
import { OKXConfig } from '../types';

dotenv.config();

export interface AppConfig {
  okx: OKXConfig;
  trading: {
    symbol: string;
    leverageMultiplier: number;
    minAdjustmentSize: number;
    instrument: string;
    dryRun: boolean;
  };
  scheduler: {
    cronSchedule: string;
  };
  logging: {
    level: string;
  };
}

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

// Get trading symbol from env, default to ETH
const tradingSymbol = process.env.TRADING_SYMBOL || 'ETH';

export const config: AppConfig = {
  okx: {
    apiKey: validateEnvVar('OKX_API_KEY', process.env.OKX_API_KEY),
    secretKey: validateEnvVar('OKX_SECRET_KEY', process.env.OKX_SECRET_KEY),
    passphrase: validateEnvVar('OKX_PASSPHRASE', process.env.OKX_PASSPHRASE),
  },
  trading: {
    symbol: tradingSymbol,
    leverageMultiplier: Number(process.env.LEVERAGE_MULTIPLIER) || 3,
    minAdjustmentSize: Number(process.env.MIN_ADJUSTMENT_SIZE) || 0.01,
    instrument: `${tradingSymbol}-USDT-SWAP`,
    dryRun: process.env.DRY_RUN !== 'false', // Default to true for safety
  },
  scheduler: {
    cronSchedule: process.env.CRON_SCHEDULE || '5 0 * * *', // Daily at UTC 00:05
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;