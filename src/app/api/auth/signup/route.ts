import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/services/AuthService';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const result = await AuthService.signUp(email, password);
  return NextResponse.json(result);
}