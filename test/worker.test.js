import { describe, it, expect, vi } from 'vitest';

// Mock environment
const mockEnv = {
  CACHE: {
    get: vi.fn(),
    put: vi.fn()
  },
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-key',
  EBAY_TOKEN: 'test-token',
  AI: {},
  IMAGES: { put: vi.fn() },
  ENCRYPTION_KEY: 'test-key',
  FEATURE_AI_PROXY: true,
  OPENROUTER_API_KEY: 'test-key'
};

// Mock fetch
global.fetch = vi.fn();

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn(() => new Uint8Array(12)),
    subtle: {
      importKey: vi.fn(() => Promise.resolve({})),
      deriveKey: vi.fn(() => Promise.resolve('key')),
      encrypt: vi.fn(() => Promise.resolve(new Uint8Array([1,2,3]))),
      decrypt: vi.fn(() => Promise.resolve(new Uint8Array([72,101,108,108,111]))),
      digest: vi.fn(() => Promise.resolve(new Uint8Array([1,2,3])))
    }
  },
  writable: true
});

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: { id: 1 }, error: null })) })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => ({ data: {}, error: null })) })) }))
    }))
  }))
}));

// Mock @cloudflare/ai
vi.mock('@cloudflare/ai', () => ({
  Ai: vi.fn(() => ({
    run: vi.fn(() => Promise.resolve({ response: 'Test analysis' }))
  }))
}));

describe('Worker Tests', () => {
  it('should handle health check', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/health');
    const response = await handler(request, mockEnv, {});
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('should handle analyze POST', async () => {
    const { default: handler } = await import('../src/index.js');
    const formData = new FormData();
    formData.append('description', 'Test item');
    formData.append('url', 'http://test.com');
    formData.append('email', 'test@example.com');
    
    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: formData
    });
    
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ itemSummaries: [] }) });
    
    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);
  });

  it('should handle AI proxy', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'openrouter', prompt: 'Hello' })
    });
    
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ response: 'Hi' }) });
    
    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);
  });

  it('should enforce rate limiting', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/analyze', { method: 'POST' });
    
    // Simulate multiple requests
    for (let i = 0; i < 105; i++) {
      await handler(request, mockEnv, {});
    }
    
    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(429);
  });

  it('should sanitize inputs', async () => {
    const { default: handler } = await import('../src/index.js');
    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'openrouter', prompt: '<script>alert("xss")</script>Hello' })
    });
    
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ response: 'Hi' }) });
    
    await handler(request, mockEnv, {});
    // Check that fetch was called with sanitized prompt
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('Hello') // script tag removed
      })
    );
  });
});