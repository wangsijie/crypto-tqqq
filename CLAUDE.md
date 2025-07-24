# Claude Development Guide - ETH 3x Leverage Strategy

## Project Overview
This is an automated ETH perpetual contract rebalancing tool that maintains 3x leverage using OKX API. The system runs daily to adjust positions based on account equity.

## Key Context
- **Target Formula:** `Target Position (ETH) = Current Equity (USDT) × 3 ÷ Current ETH Price (USDT)`
- **Trading Pair:** ETHUSDT perpetual contract (long positions only)
- **Rebalancing:** Daily at UTC 00:05
- **Minimum Adjustment:** 0.01 ETH threshold
- **API:** OKX exchange API

## Development Guidelines

### Code Standards
- Use TypeScript for type safety
- Follow Node.js best practices
- Implement proper error handling and logging
- Use environment variables for sensitive configuration
- Add comprehensive JSDoc comments for all functions

### Project Structure
```
src/
├── config/          # Configuration and environment setup
├── api/             # OKX API client and wrapper functions
├── services/        # Core business logic services
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions
└── index.ts         # Main application entry point
```

### Implementation Order
Follow the roadmap in `ROADMAP.md` - prioritize high priority tasks first. Always:
1. Update TODO list progress using TodoWrite tool
2. Test each component before moving to next
3. Add proper error handling and logging
4. Validate with OKX API documentation

### Security Requirements
- Never commit API keys or sensitive data
- Use environment variables for credentials
- Implement rate limiting and retry logic
- Add input validation for all API responses

### Testing Strategy
- Unit tests for calculation logic
- Integration tests for API functions
- Mock OKX API responses for testing
- Validate edge cases (network failures, invalid responses)

### Commands to Run
- `npm run dev` - Development mode
- `npm run build` - Build TypeScript
- `npm run start` - Production mode
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Important Notes
- Always check current roadmap progress before implementing new features
- Maintain transaction logs for audit purposes
- Implement graceful shutdown handling
- Consider market hours and maintenance windows
- Add monitoring and alerting for failures