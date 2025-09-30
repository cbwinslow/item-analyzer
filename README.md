# Item Analyzer Platform

A Cloudflare-based platform for analyzing items for sale, conducting marketplace research, and generating detailed reports.

## Features

- Upload images, descriptions, URLs for items
- AI-powered image recognition and analysis
- Marketplace research on eBay, Facebook Marketplace, Mercari
- Automated posting to marketplaces
- Multiple report formats: Text, JSON, CSV, Markdown
- Email and SMS delivery
- Payment processing with Stripe
- Secure with Cloudflare WAF and Access

## Tech Stack

- Cloudflare Workers
- Cloudflare Pages
- Supabase (PostgreSQL with auth)
- Cloudflare AI
- Cloudflare R2 (for images)
- Stripe for payments
- Docker Compose for additional services (monitoring, AI, workflows)

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Set up Supabase: Create project, run schema.sql in Supabase SQL editor
4. Configure wrangler.toml with API keys (Supabase URL/KEY, etc.)
5. For additional services: `docker-compose up -d`
6. Run locally: `npm run dev`
7. Deploy: `npm run deploy`

## Test Environment

- Run tests: `npm test`
- For full test env: `docker-compose -f docker-compose.test.yml up -d` (if created)
- Local AI: Access LocalAI at http://localhost:8080
- N8N workflows: http://localhost:5678
- Monitoring: Prometheus http://localhost:9090, Grafana http://localhost:3000

## Integrations

- N8N: Triggers workflow after analysis
- Supabase Auth: Signup/Login APIs
- OpenWebUI: For AI chat interface
- Ollama: Local LLM
- RabbitMQ: For message queuing
- OpenSearch: For indexing and search

## Deployment

1. Set up Cloudflare account and install Wrangler.
2. Create Supabase project and run schema.sql.
3. Set up R2 bucket, KV namespace, D1 database via Wrangler.
4. Configure API keys in wrangler.toml.
5. For additional services: `docker-compose up -d`
6. Deploy: `wrangler deploy`
7. Access at your Cloudflare domain.

## Health Check

GET /api/health

## API Keys Required

- CLOUDFLARE_API_TOKEN
- STRIPE_SECRET
- EBAY_APP_ID
- FACEBOOK_APP_ID
- MERCARI_API_KEY

## Compliance

Adheres to GDPR, CCPA for data protection. User data is encrypted, stored securely in Cloudflare D1/R2. No data shared without consent. Users can request data deletion.

## Development Notes

- Use AI Gateway for model routing
- Observability enabled for logging
- Rate limiting via Cloudflare