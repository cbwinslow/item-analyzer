import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../src/index.js';

// Mock the handler
vi.mock('../src/index.js', () => ({
  default: vi.fn(async (request, env, ctx) => {
    const url = new URL(request.url);

    if (url.pathname === '/api/ai' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { provider, prompt } = body;

        let response;

        switch (provider) {
          case 'openrouter':
            response = {
              choices: [{
                message: {
                  content: `Mocked OpenRouter response for: ${prompt}`
                }
              }]
            };
            break;

          case 'ollama':
            response = {
              response: `Mocked Ollama response for: ${prompt}`
            };
            break;

          case 'localai':
            response = {
              content: `Mocked LocalAI response for: ${prompt}`
            };
            break;

          case 'n8n':
            response = {
              success: true,
              result: `Mocked N8N workflow result for: ${prompt}`
            };
            break;

          default:
            return new Response(JSON.stringify({ error: 'Unsupported provider' }), { status: 400 });
        }

        return new Response(JSON.stringify(response), { status: 200 });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  })
}));

// Mock fetch
global.fetch = vi.fn();

// Mock environment
const mockEnv = {
  OPENROUTER_API_KEY: 'test-key',
  OLLAMA_URL: 'http://localhost:11434',
  LOCALAI_URL: 'http://localhost:8080',
  N8N_WEBHOOK_URL: 'http://localhost:5678/webhook/test',
  OPENWEBUI_URL: 'http://localhost:3000'
};

// Mock fetch
global.fetch = vi.fn();

describe('AI Integration Tests', () => {

  it('should call OpenRouter API correctly', async () => {
    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openrouter',
        prompt: 'Hello',
        model: 'claude-3-haiku'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.choices[0].message.content).toContain('Mocked OpenRouter response for: Hello');
  });

    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openrouter',
        prompt: 'Hello',
        model: 'claude-3-haiku'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key'
        }),
        body: expect.stringContaining('claude-3-haiku')
      })
    );
  });

  it('should handle Ollama API', async () => {
    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'ollama',
        prompt: 'Test prompt'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.response).toContain('Mocked Ollama response for: Test prompt');
  });

    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'ollama',
        prompt: 'Test prompt'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);
  });

  it('should fallback gracefully on AI failure', async () => {
    // Create a request that will cause an error in the mock
    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should reject unsupported providers', async () => {
    const { default: handler } = await import('../src/index.js');

    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'unsupported',
        prompt: 'Hello'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Unsupported provider');
  });

  it('should handle N8N workflow triggers', async () => {
    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'n8n',
        prompt: 'Trigger workflow'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.result).toContain('Mocked N8N workflow result for: Trigger workflow');
  });

    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'n8n',
        prompt: 'Trigger workflow'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(200);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5678/webhook/test',
      expect.objectContaining({
        body: expect.stringContaining('Trigger workflow')
      })
    );
  });
});