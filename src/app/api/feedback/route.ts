import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  const { itemId, rating, comments, userEmail } = await request.json();
  const { error } = await supabase.from('feedback').insert({
    item_id: itemId,
    user_email: userEmail,
    rating,
    comments
  });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ message: 'Feedback submitted' });
}