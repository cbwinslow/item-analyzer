import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '../../../../lib/services/PostService';

export async function POST(request: NextRequest) {
  const { platform, itemId, userToken } = await request.json();
  try {
    let result;
    if (platform === 'ebay') {
      result = await PostService.postToEbay(itemId, userToken);
    } else if (platform === 'facebook') {
      result = await PostService.postToFacebook(itemId, userToken);
    } else if (platform === 'mercari') {
      result = await PostService.postToMercari(itemId, userToken);
    } else {
      throw new Error('Unsupported platform');
    }
    return NextResponse.json({ message: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}