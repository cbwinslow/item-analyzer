import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { config } from '../../../../config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];
    const description = formData.get('description') as string;
    const itemUrl = formData.get('url') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const format = formData.get('format') as string || 'text';

    // Placeholder AI analysis
    const imageDescriptions = images.map(() => 'Sample description');

    // Placeholder research
    const research = 'Sample research data';

    // Generate report
    const report = `Report for ${description}`;

    // Store in Supabase
    const { data, error } = await supabase.from('items').insert({
      description,
      url: itemUrl,
      email,
      phone,
      image_urls: '[]',
      report
    }).select().single();
    if (error) throw error;

    // Format response
    let responseBody;
    if (format === 'json') {
      responseBody = JSON.stringify({ description, itemUrl, imageDescriptions, research, report });
    } else {
      responseBody = report;
    }

    return NextResponse.json({ report: responseBody }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}