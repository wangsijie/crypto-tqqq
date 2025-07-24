/**
 * Configuration module for API credentials and trading parameters
 */

import dotenv from 'dotenv';
import { OKXConfig } from '../types';

dotenv.config();

export interface AppConfig {
  okx: OKXConfig;
  trading: {
    leverageMultiplier: number;
    minAdjustmentETH: number;
    instrument: string;
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

export const config: AppConfig = {
  okx: {
    apiKey: validateEnvVar('OKX_API_KEY', process.env.OKX_API_KEY),
    secretKey: validateEnvVar('OKX_SECRET_KEY', process.env.OKX_SECRET_KEY),
    passphrase: validateEnvVar('OKX_PASSPHRASE', process.env.OKX_PASSPHRASE),
  },
  trading: {
    leverageMultiplier: Number(process.env.LEVERAGE_MULTIPLIER) || 3,
    minAdjustmentETH: Number(process.env.MIN_ADJUSTMENT_ETH) || 0.01,
    instrument: 'ETH-USDT-SWAP',
  },
  scheduler: {
    cronSchedule: process.env.CRON_SCHEDULE || '5 0 * * *', // Daily at UTC 00:05
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;