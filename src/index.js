import { Ai } from '@cloudflare/ai';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Helper function for marketplace research
async function researchItem(description, url, env) {
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

    return `${ebayInfo}. ${fbInfo}. ${mercariInfo}`;
  } catch (error) {
  return 'Market research failed: ' + error.message;
}

// Helper function for sending email
async function sendEmail(to, content, env) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@itemanalyzer.com' },
      subject: 'Your Item Analysis Report',
      content: [{ type: 'text/plain', value: content }]
    })
  });
  if (!response.ok) throw new Error('Email send failed');
}

// Helper function for sending SMS
async function sendSMS(to, content, env) {
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${env.TWILIO_SID}:${env.TWILIO_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      To: to,
      From: env.TWILIO_FROM,
      Body: content
    })
  });
  if (!response.ok) throw new Error('SMS send failed');
}

// Helper function for posting to marketplace
async function postToMarketplace(platform, itemId, supabase) {
  // Get item from Supabase
  const { data: item, error } = await supabase.from('items').select('*').eq('id', itemId).single();
  if (error || !item) return 'Item not found';

  if (platform === 'ebay') {
    // Placeholder for eBay posting
    return 'Posted to eBay: ' + item.description;
  } else if (platform === 'facebook') {
    // Placeholder
    return 'Posted to Facebook Marketplace: ' + item.description;
  } else if (platform === 'mercari') {
    // Placeholder
    return 'Posted to Mercari: ' + item.description;
  }
  return 'Unsupported platform';
}

// Helper function for creating Stripe subscription
async function createSubscription(email, priceId, env) {
  const stripe = new Stripe(env.STRIPE_SECRET);
  const customer = await stripe.customers.create({ email });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  });
  return {
    subscriptionId: subscription.id,
    clientSecret: subscription.latest_invoice.payment_intent.client_secret
  };
}
}

// Cloudflare Worker for Item Analyzer
export default {
  async fetch(request, env, ctx) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const url = new URL(request.url);

    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      // ... existing code
    } else if (url.pathname === '/api/post' && request.method === 'POST') {
      const formData = await request.formData();
      const platform = formData.get('platform');
      const itemId = formData.get('itemId');
      // Placeholder for posting
      const result = await postToMarketplace(platform, itemId, supabase);
      return new Response(result, { headers: { 'content-type': 'text/plain' } });
    } else if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      const { email, priceId } = await request.json();
      const subscription = await createSubscription(email, priceId, env);
      return new Response(JSON.stringify(subscription), {
        headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
      // Handle form submission
      const formData = await request.formData();
      const images = formData.getAll('images');
      const description = formData.get('description');
      const itemUrl = formData.get('url');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const format = formData.get('format') || 'text';

      // Upload images to R2
      const imageUrls = [];
      for (const image of images) {
        const key = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${image.name.split('.').pop()}`;
        await env.IMAGES.put(key, image);
        imageUrls.push(`https://item-images.your-domain.com/${key}`); // Replace with actual domain
      }

      // AI Analysis
      const ai = new Ai(env.AI);
      let imageDescriptions = [];
      for (const image of images) {
        const imageBuffer = await image.arrayBuffer();
        const result = await ai.run('@cf/microsoft/resnet-50', { image: [...new Uint8Array(imageBuffer)] });
        imageDescriptions.push(result.description || 'No description');
      }

      // Marketplace Research
      const research = await researchItem(description, itemUrl, env);

      // Generate report using AI
      const prompt = `Analyze this item: Description: ${description}, URL: ${itemUrl}, Images: ${imageDescriptions.join(', ')}, Research: ${research}. Provide a deep research report on the item, including market value, similar items, and selling tips.`;
      const reportResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt });
      const report = reportResponse.response || 'Report generation failed';

      // Store in Supabase
      const { error } = await supabase.from('items').insert({
        description,
        url: itemUrl,
        email,
        phone,
        image_urls: imageUrls.join(','),
        report
      });
      if (error) throw error;

      // Placeholder for payment: assume paid or add payment check
      // const stripe = new Stripe(env.STRIPE_SECRET);
      // const paymentIntent = await stripe.paymentIntents.create({ amount: 500, currency: 'usd' }); // $5

      // Format response
      let responseBody;
      let contentType;
      if (format === 'json') {
        responseBody = JSON.stringify({ description, itemUrl, imageDescriptions, research, report });
        contentType = 'application/json';
      } else if (format === 'csv') {
        responseBody = `Description,URL,Images,Research,Report\n"${description}","${itemUrl}","${imageDescriptions.join('; ')}","${research}","${report}"`;
        contentType = 'text/csv';
      } else if (format === 'markdown') {
        responseBody = `# Item Analysis\n\n**Description:** ${description}\n\n**URL:** ${itemUrl}\n\n**Images:** ${imageDescriptions.join(', ')}\n\n**Research:** ${research}\n\n**Report:** ${report}`;
        contentType = 'text/markdown';
      } else {
        responseBody = report;
        contentType = 'text/plain';
      }

      // Send email if provided
      if (email) {
        await sendEmail(email, report, env);
      }

      // Send SMS if provided
      if (phone) {
        await sendSMS(phone, report.substring(0, 160), env); // Truncate for SMS
      }

      return new Response(responseBody, {
        headers: {
          'content-type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
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