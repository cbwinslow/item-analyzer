# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- User authentication with Supabase
- Dashboard for viewing past analyses
- Data deletion API for GDPR compliance
- RabbitMQ integration for queuing
- OpenSearch indexing for search
- N8N workflow triggers
- SMS delivery via Twilio
- Email delivery via SendGrid
- Stripe subscription management
- Image storage on R2
- AI analysis with Cloudflare AI
- Marketplace research placeholders
- Multiple report formats (JSON, CSV, Markdown)
- Docker Compose for monitoring and AI services
- CI/CD with GitHub Actions
- Error handling and logging
- Health check endpoint
- Caching with KV

### Changed
- Switched from D1 to Supabase for database
- Enhanced frontend with auth UI

### Fixed
- CORS issues
- Error responses