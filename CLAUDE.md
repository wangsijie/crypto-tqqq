# Claude Development Guide - Crypto 3x Leverage Strategy

## Project Overview
This is an automated cryptocurrency perpetual contract rebalancing tool that maintains 3x leverage using OKX API. The system runs daily to adjust positions based on account equity. The trading instrument is configurable via environment variables.

## Key Context
- **Target Formula:** `Target Position = Current Equity (USDT) × 3 ÷ Current Asset Price (USDT)`
- **Trading Pair:** Configurable via `TRADING_SYMBOL` env var (e.g., ETH, DOGE, BTC)
- **Rebalancing:** Daily at UTC 00:05
- **Minimum Adjustment:** Configurable via `MIN_ADJUSTMENT_SIZE` env var
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
- `npm run start` - Single rebalancing execution
- `npm run scheduler` - Continuous scheduler (Docker-friendly)
- `npm run test` - Run tests
- `npm run lint` - Lint code

### Docker Deployment
- `docker-compose up -d` - Start scheduled rebalancing
- `docker-compose logs -f` - View logs
- `docker-compose down` - Stop container

## Important Notes
- Maintain transaction logs for audit purposes
- Implement graceful shutdown handling
- Consider market hours and maintenance windows
- Add monitoring and alerting for failures