import { Ai } from '@cloudflare/ai';
import Stripe from 'stripe';

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
}

// Cloudflare Worker for Item Analyzer
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      // Handle form submission
      const formData = await request.formData();
      const images = formData.getAll('images');
      const description = formData.get('description');
      const itemUrl = formData.get('url');
      const email = formData.get('email');
      const format = formData.get('format') || 'text';

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

      // Store in D1
      await env.DB.prepare('INSERT INTO items (description, url, email, report) VALUES (?, ?, ?, ?)').bind(description, itemUrl, email, report).run();

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

      return new Response(responseBody, { headers: { 'content-type': contentType } });
    }

    // Serve static files
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = `<!DOCTYPE html><html><body><h1>Item Analyzer</h1><form action="/api/analyze" method="post" enctype="multipart/form-data"><input type="file" name="images" multiple><textarea name="description"></textarea><input type="url" name="url"><input type="email" name="email"><button>Submit</button></form></body></html>`;
      return new Response(html, { headers: { 'content-type': 'text/html' } });
    }

    return new Response('Not Found', { status: 404 });
  },
};