
import { describe, it, expect, vi } from 'vitest';

// Mock environment
const mockEnv = {
  CACHE: { get: vi.fn(), put: vi.fn() },
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-key',
  EBAY_TOKEN: 'test-token',
  AI: {},
  IMAGES: { put: vi.fn() },
  ENCRYPTION_KEY: 'test-key'
};

describe('index Worker', () => {
  it('handles health check', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/health');

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('handles POST requests', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);
  });

  it('handles invalid requests', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/invalid');

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(404);
  });

  it('enforces rate limiting', async () => {
    const { default: handler } = await import('../src/index.js');

    // Simulate multiple requests
    for (let i = 0; i < 105; i++) {
      const request = new Request('http://localhost/api/index', { method: 'POST' });
      await handler(request, mockEnv, {});
    }

    const request = new Request('http://localhost/api/index', { method: 'POST' });
    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(429);
  });

  it('sanitizes inputs', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/index', {
      method: 'POST',
      body: JSON.stringify({ input: '<script>alert("xss")</script>test' })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);

    // Verify input was sanitized
    const data = await response.text();
    expect(data).not.toContain('<script>');
  });
});
