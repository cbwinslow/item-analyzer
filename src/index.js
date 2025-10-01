import { Ai } from '@cloudflare/ai';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Client } from '@opensearch-project/opensearch';

// Encryption helpers
async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );
  return { encrypted: new Uint8Array(encrypted), iv };
}

async function decryptData(encryptedData, iv, key) {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

async function getEncryptionKey(env) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.ENCRYPTION_KEY),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function for marketplace research
async function researchItem(description, url, env) {
  const cacheKey = `research:${description}`;
  let cached = await env.CACHE.get(cacheKey);
  if (cached) return cached;

  try {
    // eBay API
    const ebayResponse = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(description)}&limit=10`, {
      headers: { 'Authorization': `Bearer ${env.EBAY_TOKEN}` }
    });
    const ebayData = await ebayResponse.json();
    const ebayInfo = `eBay: ${ebayData.itemSummaries?.length || 0} similar items, avg price: $${ebayData.itemSummaries?.[0]?.price?.value || 'N/A'}`;

    // Facebook Marketplace (placeholder, use Graph API)
    const fbInfo = 'Facebook: Integrate Graph API for marketplace data.';

    // Mercari (placeholder)
    const mercariInfo = 'Mercari: Integrate API for data.';

    const result = `${ebayInfo}. ${fbInfo}. ${mercariInfo}`;
    await env.CACHE.put(cacheKey, result, { expirationTtl: 3600 }); // Cache for 1 hour
    return result;
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    } else if (url.pathname === '/api/ai' && request.method === 'POST') {
      try {
        const { provider, prompt, model = 'claude-3-haiku' } = await request.json();
        let response;
        if (provider === 'openrouter') {
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model || 'anthropic/claude-3-haiku',
              messages: [{ role: 'user', content: prompt }]
            })
          });
        } else if (provider === 'ollama') {
          response = await fetch(`${env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model || 'llama2', prompt })
          });
        } else if (provider === 'localai') {
          response = await fetch(`${env.LOCALAI_URL || 'http://localhost:8080'}/v1/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model || 'gpt-3.5-turbo', prompt })
          });
        } else if (provider === 'n8n') {
          response = await fetch(env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, provider: 'ai' })
          });
        } else if (provider === 'openwebui') {
          response = await fetch(`${env.OPENWEBUI_URL || 'http://localhost:3000'}/api/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
          });
        } else {
          throw new Error('Unsupported provider');
        }
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    } else if (url.pathname === '/api/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else if (url.pathname === '/api/send-otp' && request.method === 'POST') {
      try {
        const { phone } = await request.json();
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        await env.CACHE.put(`otp:${phone}`, otp, { expirationTtl: 300 }); // 5 min
        await sendSMS(phone, `Your OTP is: ${otp}`, env);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    } else if (url.pathname === '/api/verify-otp' && request.method === 'POST') {
      try {
        const { phone, otp } = await request.json();
        const storedOtp = await env.CACHE.get(`otp:${phone}`);
        if (storedOtp === otp) {
          await env.CACHE.delete(`otp:${phone}`);
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } else {
          return new Response(JSON.stringify({ success: false, message: 'Invalid OTP' }), {
            status: 400,
            headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    } else if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      try {
        const { email, tier } = await request.json();
        const priceIds = {
          free: null,
          basic: env.STRIPE_BASIC_PRICE_ID,
          premium: env.STRIPE_PREMIUM_PRICE_ID
        };
        const priceId = priceIds[tier];
        if (!priceId && tier !== 'free') throw new Error('Invalid tier');
        if (tier === 'free') {
          return new Response(JSON.stringify({ success: true, tier: 'free' }), {
            headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        const result = await createSubscription(email, priceId, env);
        return new Response(JSON.stringify(result), {
          headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    } else if (url.pathname.startsWith('/api/affiliate-earnings') && request.method === 'GET') {
      try {
        const affiliateCode = url.searchParams.get('code');
        if (!affiliateCode) throw new Error('Affiliate code required');
        const { data, error } = await supabase.from('items').select('id').eq('affiliate_code', affiliateCode);
        if (error) throw error;
        const earnings = data.length * 0.5; // $0.50 per referral
        return new Response(JSON.stringify({ affiliateCode, referrals: data.length, earnings }), {
          headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    } else if (url.pathname === '/api/item' && request.method === 'GET') {
      try {
        const shareCode = url.searchParams.get('share_code');
        if (!shareCode) throw new Error('Share code required');
        const { data, error } = await supabase.from('items').select('*').eq('share_code', shareCode).single();
        if (error || !data) throw new Error('Item not found');
        // Decrypt sensitive data
        let email = null;
        let phone = null;
        if (data.email) {
          const emailData = JSON.parse(data.email);
          email = await decryptData(new Uint8Array(emailData.encrypted), new Uint8Array(emailData.iv), encryptionKey);
        }
        if (data.phone) {
          const phoneData = JSON.parse(data.phone);
          phone = await decryptData(new Uint8Array(phoneData.encrypted), new Uint8Array(phoneData.iv), encryptionKey);
        }
        // For AR visualization, add placeholder
        const arData = { model: 'placeholder.glb', position: [0, 0, 0] };
        // For blockchain authenticity, add hash
        const reportHash = await hashString(data.report);
        const blockchainProof = `Hash: ${reportHash}, stored on blockchain (placeholder)`;
        return new Response(JSON.stringify({
          description: data.description,
          url: data.url,
          email,
          phone,
          image_urls: data.image_urls,
          report: data.report,
          ar_visualization: arData,
          blockchain_authenticity: blockchainProof
        }), {
          headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    } else if (url.pathname === '/api/feedback' && request.method === 'POST') {
      try {
        const { itemId, rating, comment } = await request.json();
        const { error } = await supabase.from('feedback').insert({
          item_id: itemId,
          rating,
          comment
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
      }
    }

    // Serve static files
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = `<!DOCTYPE html><html><body><h1>Item Analyzer</h1><form action="/api/analyze" method="post" enctype="multipart/form-data"><input type="file" name="images" multiple><textarea name="description"></textarea><input type="url" name="url"><input type="email" name="email"><button>Submit</button></form></body></html>`;
      return new Response(html, { headers: { 'content-type': 'text/html' } });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    return new Response('Not Found', { status: 404 });
  },
};