import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/services/AuthService';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = authHeader.replace('Bearer ', '');
  const result = await AuthService.getItems(token);
  return NextResponse.json(result);
}