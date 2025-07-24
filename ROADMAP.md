# ETH 3x Leverage Strategy - Implementation Roadmap

## Project Overview
Automated daily rebalancing tool for ETH perpetual contracts using OKX API to maintain 3x leverage position.

**Target Formula:** `Target Position (ETH) = Current Equity (USDT) × 3 ÷ Current ETH Price (USDT)`

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
- [x] Create position calculation logic: target = equity × 3 ÷ ETH_price
- [x] Create delta calculation and decision logic (minimum 0.01 ETH threshold)
- [ ] Create transaction logging system (time, price, equity, position, adjustment) *(in progress)*
- [ ] Add error handling and retry mechanisms for API failures
- [ ] Create daily scheduler (cron job for UTC 00:05)

### Low Priority
- [ ] Add comprehensive testing and validation
- [ ] Create documentation and setup instructions

## Key Requirements
- **Trading Pair:** ETHUSDT perpetual contract (long positions only)
- **Rebalancing Frequency:** Daily at UTC 00:05
- **Minimum Adjustment:** 0.01 ETH
- **Leverage Target:** 3x
- **Logging:** All trades with timestamp, price, equity, position, and adjustment amount

## Example Calculation
- Current ETH/USDT = 2,100
- Current Equity = 12,000 USDT
- Current Position = 15 ETH
- Target Position = 12,000 × 3 ÷ 2,100 = 17.14 ETH
- Delta = 17.14 - 15 = +2.14 ETH
- **Action:** Market buy 2.14 ETH contracts