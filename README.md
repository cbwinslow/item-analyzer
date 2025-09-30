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
- Cloudflare D1 (SQLite)
- Cloudflare AI
- Cloudflare R2 (for images)
- Stripe for payments

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Configure wrangler.toml with your API keys
4. Run locally: `npm run dev`
5. Deploy: `npm run deploy`

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