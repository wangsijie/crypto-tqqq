# Crypto 3x Leverage Strategy - Implementation Roadmap

## Project Overview
Automated daily rebalancing tool for cryptocurrency perpetual contracts using OKX API to maintain 3x leverage position.

**Target Formula:** `Target Position = Current Equity (USDT) × 3 ÷ Current Asset Price (USDT)`

## Implementation Tasks

### High Priority
- [x] Project setup: Initialize Node.js project with package.json and basic folder structure
- [x] Install and configure OKX API SDK or HTTP client for API interactions
- [x] Create configuration module for API credentials and trading parameters
- [x] Implement function to get account equity (total net worth including unrealized PnL)
- [x] Implement function to get current ETH/USDT perpetual contract price
- [x] Implement function to get current ETH perpetual position size
- [x] Implement market order execution function for position adjustments
- [ ] Implement main rebalancing logic that orchestrates all steps

### Medium Priority
- [x] Create position calculation logic: target = equity × 3 ÷ asset_price
- [x] Create delta calculation and decision logic (minimum adjustment threshold)
- [x] Create transaction logging system (time, price, equity, position, adjustment)
- [x] Make trading instrument configurable (support any crypto via env vars)
- [ ] Add error handling and retry mechanisms for API failures
- [ ] Create daily scheduler (cron job for UTC 00:05)

### Low Priority
- [ ] Add comprehensive testing and validation
- [ ] Create documentation and setup instructions

## Key Requirements
- **Trading Pair:** Configurable via `TRADING_SYMBOL` environment variable (e.g., ETH, DOGE, BTC)
- **Rebalancing Frequency:** Daily at UTC 00:05
- **Minimum Adjustment:** Configurable via `MIN_ADJUSTMENT_SIZE` environment variable
- **Leverage Target:** 3x (configurable via `LEVERAGE_MULTIPLIER`)
- **Logging:** All trades with timestamp, price, equity, position, and adjustment amount

## Example Calculation
- Current Asset Price = 2,100 USDT
- Current Equity = 12,000 USDT
- Current Position = 15 units
- Target Position = 12,000 × 3 ÷ 2,100 = 17.14 units
- Delta = 17.14 - 15 = +2.14 units
- **Action:** Market buy 2.14 contracts