import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call OpenRouter API correctly', async () => {
    const { default: handler } = await import('../src/index.js');
    
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ choices: [{ message: { content: 'Hello from AI' } }] })
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
    const { default: handler } = await import('../src/index.js');
    
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ response: 'Ollama response' })
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

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.any(Object)
    );
  });

  it('should fallback gracefully on AI failure', async () => {
    const { default: handler } = await import('../src/index.js');
    
    global.fetch.mockRejectedValueOnce(new Error('API down'));

    const request = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openrouter',
        prompt: 'Hello'
      })
    });

    const response = await handler(request, mockEnv, {});
    expect(response.status).toBe(500);

    const error = await response.text();
    expect(error).toContain('API down');
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
    expect(response.status).toBe(500);

    const error = await response.text();
    expect(error).toContain('Unsupported provider');
  });

  it('should handle N8N workflow triggers', async () => {
    const { default: handler } = await import('../src/index.js');
    
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true })
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