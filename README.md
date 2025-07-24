# Crypto 3x Leverage Strategy Bot

An automated cryptocurrency perpetual contract rebalancing tool that maintains 3x leverage using the OKX API. The system runs daily to adjust positions based on account equity and supports multiple trading pairs with Telegram notifications for dry-run mode.

## 🚀 Features

- **Automated 3x leverage maintenance** - Calculates and adjusts positions to maintain target leverage
- **Multi-asset support** - Configurable trading symbols (ETH, BTC, DOGE, etc.)
- **Safety-first design** - Defaults to dry-run mode for safe testing
- **Telegram notifications** - Real-time notifications for dry-run trades
- **Docker support** - Easy deployment with Docker Compose
- **Comprehensive logging** - Transaction logs with audit trail
- **Flexible scheduling** - Configurable cron-based execution

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Telegram Setup](#telegram-setup)
- [Docker Deployment](#docker-deployment)
- [Development](#development)
- [Project Structure](#project-structure)
- [Trading Logic](#trading-logic)
- [Safety Features](#safety-features)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- Node.js 18+ or Docker
- OKX exchange account with API credentials
- Trading balance in USDT
- (Optional) Telegram bot for notifications

## 📦 Installation

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/wangsijie/crypto-tqqq.git
cd crypto-tqqq

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit configuration (see Configuration section)
nano .env

# Build the project
npm run build
```

### Option 2: Docker (Recommended for Production)

```bash
# Clone and configure
git clone https://github.com/wangsijie/crypto-tqqq.git
cd crypto-tqqq
cp .env.example .env

# Edit .env with your settings
nano .env

# Start with Docker Compose
docker-compose up -d
```

## ⚙️ Configuration

Create a `.env` file based on `.env.example`:

```bash
# OKX API Configuration (Required)
OKX_API_KEY=your_api_key_here
OKX_SECRET_KEY=your_secret_key_here
OKX_PASSPHRASE=your_passphrase_here

# Trading Configuration
TRADING_SYMBOL=ETH              # Can be ETH, DOGE, BTC, etc.
LEVERAGE_MULTIPLIER=3           # Target leverage multiplier
MIN_ADJUSTMENT_SIZE=0.01        # Minimum adjustment size in base currency
CRON_SCHEDULE=5 0 * * *        # Daily at UTC 00:05
DRY_RUN=true                   # Set to false for live trading

# Logging
LOG_LEVEL=info

# Telegram Notifications (Optional)
TELEGRAM_ENABLED=false         # Set to true to enable notifications
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OKX_API_KEY` | Your OKX API key | - | ✅ |
| `OKX_SECRET_KEY` | Your OKX secret key | - | ✅ |
| `OKX_PASSPHRASE` | Your OKX passphrase | - | ✅ |
| `TRADING_SYMBOL` | Asset to trade (ETH, BTC, DOGE, etc.) | ETH | ❌ |
| `LEVERAGE_MULTIPLIER` | Target leverage multiplier | 3 | ❌ |
| `MIN_ADJUSTMENT_SIZE` | Minimum trade size | 0.01 | ❌ |
| `CRON_SCHEDULE` | Execution schedule | 5 0 * * * | ❌ |
| `DRY_RUN` | Safe mode (true/false) | true | ❌ |
| `TELEGRAM_ENABLED` | Enable Telegram notifications | false | ❌ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | - | ❌ |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID | - | ❌ |

## 🎯 Usage

### Single Execution

```bash
# Dry run (safe mode)
npm run start

# Live trading (set DRY_RUN=false in .env first)
npm run start
```

### Continuous Scheduling

```bash
# Start scheduler (runs based on CRON_SCHEDULE)
npm run scheduler
```

### Development Mode

```bash
# Watch mode with hot reload
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📱 Telegram Setup

1. **Create a Telegram Bot:**
   - Message @BotFather on Telegram
   - Use `/newbot` command
   - Follow instructions to get your bot token

2. **Get Your Chat ID:**
   - Set `TELEGRAM_BOT_TOKEN` in your `.env`
   - Send a message to your bot
   - Run: `node -e "require('dotenv').config(); require('axios').get('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/getUpdates').then(r => console.log('Chat ID:', r.data.result[0].message.chat.id))"`

3. **Enable Telegram:**
   ```bash
   TELEGRAM_ENABLED=true
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

### Telegram Message Format

The bot sends detailed notifications including:
- 🧪 Dry-run status indicator
- 📊 Current asset price and account equity
- 📍 Current vs target positions
- 📈/📉 Proposed trade actions and sizes
- ⏰ Execution timestamp

## 🐳 Docker Deployment

### Production Deployment

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down

# Update and restart
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Docker Configuration

The `docker-compose.yml` includes:
- Automatic restarts
- Log rotation (10MB max, 3 files)
- Health checks
- Volume mounting for persistent logs

## 🛠️ Development

### Project Scripts

```bash
npm run dev        # Development with hot reload
npm run build      # Build TypeScript to JavaScript
npm run start      # Single execution
npm run scheduler  # Continuous scheduling
npm run test       # Run test suite
npm run lint       # Code linting
npm run typecheck  # TypeScript type checking
```

### Adding New Features

1. **API Extensions:** Add new methods to `src/api/okx-client.ts`
2. **Strategy Logic:** Modify `src/services/strategy.ts`
3. **Configuration:** Update `src/config/index.ts`
4. **Notifications:** Extend `src/services/telegram.ts`

## 📁 Project Structure

```
src/
├── api/             # OKX API client and wrapper functions
│   └── okx-client.ts
├── config/          # Configuration and environment setup
│   └── index.ts
├── services/        # Core business logic services
│   ├── strategy.ts  # Main rebalancing logic
│   ├── logger.ts    # Transaction logging
│   └── telegram.ts  # Telegram notifications
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions and helpers
└── index.ts         # Main application entry point
```

## 🧮 Trading Logic

### Position Calculation Formula

```
Target Position = Current Equity (USDT) × Leverage Multiplier ÷ Asset Price (USDT)
```

### Rebalancing Decision

The bot adjusts positions when:
```
|Current Position - Target Position| ≥ MIN_ADJUSTMENT_SIZE
```

### Example Calculation

- Account Equity: $1,000 USDT
- ETH Price: $2,000 USDT
- Target Leverage: 3x
- Target Position: (1,000 × 3) ÷ 2,000 = 1.5 ETH

## 🛡️ Safety Features

### Dry-Run Mode (Default)
- **Always enabled by default** for safety
- Simulates all trades without execution
- Sends Telegram notifications showing what would be executed
- Full logging and analysis without risk

### Risk Management
- Minimum adjustment thresholds prevent over-trading
- Comprehensive error handling and logging
- API rate limiting and retry logic
- Input validation for all parameters

### Monitoring
- Transaction logs with full audit trail
- Health checks for Docker deployment
- Telegram notifications for transparency
- Console logging for debugging

## 🔍 Troubleshooting

### Common Issues

**1. API Authentication Errors**
```bash
# Verify your OKX API credentials
# Ensure API has trading permissions
# Check IP whitelist settings on OKX
```

**2. Telegram Not Working**
```bash
# Verify bot token is correct
# Check chat ID is accurate
# Ensure bot can send messages to your chat
# Test with: TELEGRAM_ENABLED=true
```

**3. Docker Issues**
```bash
# Check logs
docker-compose logs -f

# Rebuild container
docker-compose build --no-cache

# Check environment variables
docker-compose exec crypto-rebalancer env | grep -E "(OKX|TELEGRAM)"
```

**4. TypeScript Errors**
```bash
# Type check
npm run typecheck

# Rebuild
npm run build
```

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug
```

### Support

- Check the [Issues](https://github.com/wangsijie/crypto-tqqq/issues) page
- Review logs in the `./logs` directory
- Use dry-run mode to test configuration safely

## ⚠️ Disclaimer

This software is provided for educational purposes only. Cryptocurrency trading involves substantial risk of loss. The authors are not responsible for any financial losses incurred through the use of this software. Always test thoroughly in dry-run mode before enabling live trading.

## 📄 License

ISC License - see LICENSE file for details.

---

**Happy Trading! 🚀**

*Remember: Always start with dry-run mode and verify your configuration before enabling live trading.*