import { supabase } from '../supabase';
import { config } from '../../config';
import OpenAI from 'openai';

export class AnalysisService {
  private static researchCache = new Map<string, string>();
  private static openai = new OpenAI({ apiKey: config.apis.openai });

  static async analyzeItem(data: {
    description: string;
    itemUrl: string;
    email: string;
    phone: string;
    images: File[];
    format: string;
  }) {
    // AI image analysis
    const imageDescriptions = [];
    for (const image of data.images) {
      try {
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: [
              { type: 'text', text: 'Describe this image in detail for selling purposes.' },
              { type: 'image_url', image_url: { url: `data:${image.type};base64,${base64}` } }
            ]}
          ],
        });
        imageDescriptions.push(response.choices[0].message.content || 'Description unavailable');
      } catch {
        imageDescriptions.push('AI description failed');
      }
    }

    // Cached research
    const research = this.researchCache.get(data.description) || await this.generateResearch(data.description);
    if (!this.researchCache.has(data.description)) {
      this.researchCache.set(data.description, research);
    }

    // Generate intelligent report
    const reportResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Generate a detailed item analysis report for: ${data.description}. Images: ${imageDescriptions.join(', ')}. Research: ${research}. Include market value, selling tips, and recommendations.`
      }],
    });
    const report = reportResponse.choices[0].message.content || 'Report generation failed';

    // Store in Supabase
    const { data: item, error } = await supabase.from('items').insert({
      description: data.description,
      url: data.itemUrl,
      email: data.email,
      phone: data.phone,
      image_urls: '[]',
      report
    }).select().single();
    if (error) throw error;

    // Audit log
    await this.logAction(data.email, 'analyze', { itemId: item.id });

    return { report, format: data.format };
  }

  static async generateResearch(description: string): Promise<string> {
    // Use OpenAI for research simulation
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Research similar items for: ${description}. Provide market insights.` }],
    });
    return response.choices[0].message.content || 'Research unavailable';
  }

  static async logAction(userEmail: string, action: string, details: any) {
    await supabase.from('audit_logs').insert({
      user_email: userEmail,
      action,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    });
  }
}