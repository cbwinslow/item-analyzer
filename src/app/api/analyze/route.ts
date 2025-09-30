import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '../../../../lib/services/AnalysisService';
import { config } from '../../../../config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = {
      images: formData.getAll('images') as File[],
      description: formData.get('description') as string,
      itemUrl: formData.get('url') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      format: formData.get('format') as string || 'text',
    };

    const result = await AnalysisService.analyzeItem(data);

    let responseBody;
    if (result.format === 'json') {
      responseBody = JSON.stringify(result);
    } else {
      responseBody = result.report;
    }

    return NextResponse.json({ report: responseBody }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}