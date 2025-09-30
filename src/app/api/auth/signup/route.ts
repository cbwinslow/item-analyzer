import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const { data, error } = await supabase.auth.signUp({ email, password });
  return NextResponse.json({ data, error });
}