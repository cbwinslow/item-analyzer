# API Documentation

## Overview

The Item Analyzer API provides endpoints for item analysis, user management, and AI services.

## Authentication

All endpoints require API key in header: `Authorization: Bearer YOUR_API_KEY`

## Endpoints

### POST /api/analyze
Analyze an item with AI and market research.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `description` (string, required): Item description
  - `url` (string): Item URL
  - `images` (file[]): Item images
  - `email` (string): User email
  - `phone` (string): User phone
  - `format` (string): Response format (text/json/csv/markdown)
  - `affiliate_code` (string): Affiliate code

**Response:**
- 200: Analysis report
- 500: Error

### POST /api/subscribe
Create a subscription.

**Request:**
- Method: POST
- Content-Type: application/json
- Body: `{ "email": "user@example.com", "tier": "basic" }`

**Response:**
- 200: `{ "subscriptionId": "sub_xxx", "clientSecret": "cs_xxx" }`

### GET /api/item
Get shared item details.

**Request:**
- Method: GET
- Query: `share_code=abc123`

**Response:**
- 200: Item data with AR/blockchain info

### POST /api/feedback
Submit user feedback.

**Request:**
- Method: POST
- Content-Type: application/json
- Body: `{ "itemId": 123, "rating": 5, "comment": "Great!" }`

**Response:**
- 200: `{ "success": true }`

### POST /api/ai
Proxy to AI services.

**Request:**
- Method: POST
- Content-Type: application/json
- Body: `{ "provider": "openrouter", "prompt": "Hello", "model": "claude-3-haiku" }`

**Response:**
- 200: AI response

### POST /api/send-otp
Send OTP for 2FA.

**Request:**
- Method: POST
- Body: `{ "phone": "+1234567890" }`

**Response:**
- 200: `{ "success": true }`

### POST /api/verify-otp
Verify OTP.

**Request:**
- Method: POST
- Body: `{ "phone": "+1234567890", "otp": "123456" }`

**Response:**
- 200: `{ "success": true }`

### GET /api/affiliate-earnings
Get affiliate earnings.

**Request:**
- Method: GET
- Query: `code=aff123`

**Response:**
- 200: `{ "earnings": 5.0, "referrals": 10 }`

## Error Handling

All errors return JSON: `{ "error": "message" }`

## Rate Limits

- 100 requests/hour per IP
- 1000 requests/day per user