/**
 * Debug script to understand OKX API response structure
 */

import { OKXClient } from './api';
import config from './config';

async function debugAccountBalance() {
  console.log('🔍 Debugging OKX Account Balance Response...\n');
  
  try {
    const okxClient = new OKXClient(config.okx);
    
    // Get raw account balance response
    const response = await (okxClient as any).client.get('/api/v5/account/balance');
    
    console.log('Full Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.code === '0' && response.data.data && response.data.data[0]) {
      console.log('\nFirst data item:', JSON.stringify(response.data.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugAccountBalance().catch(console.error);