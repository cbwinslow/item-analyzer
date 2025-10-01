# Item Analyzer Platform

A comprehensive AI-powered platform for analyzing items, providing market insights, authentication, and collaborative features.

## Features

- AI-powered item analysis with multiple models
- Market research integration (eBay, Facebook Marketplace, Mercari)
- User authentication with 2FA
- Subscription tiers (Free, Basic, Premium)
- Affiliate program
- Collaborative sharing and feedback
- Mobile PWA support
- Real-time analytics and audit logging

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/item-analyzer.git
cd item-analyzer
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
```

3. Set up environment variables (see .env.example)

4. Deploy backend to Cloudflare:
```bash
npm run deploy
```

5. Deploy frontend:
```bash
cd frontend
npm run build
npm run start
```

## API Documentation

### Core Endpoints

- `POST /api/analyze` - Analyze an item
- `POST /api/subscribe` - Create subscription
- `GET /api/item?share_code=xxx` - Get shared item
- `POST /api/feedback` - Submit feedback
- `POST /api/ai` - Use AI proxy

See [API Docs](./api-docs.md) for full specifications.

## Deployment

### Cloudflare Worker
```bash
wrangler deploy
```

### Frontend
```bash
cd frontend
npm run build
npm run export
# Deploy to Vercel, Netlify, or Cloudflare Pages
```

## Development

### Running Locally
```bash
# Backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Testing
```bash
npm test
cd frontend && npm test
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](./SECURITY.md) for procedures.

## License

MIT License