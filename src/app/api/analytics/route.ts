import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  // Aggregate audit logs
  const { data, error } = await supabase.from('audit_logs').select('*');
  if (error) return NextResponse.json({ error }, { status: 500 });

  const actions = data.reduce((acc: any, log: any) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  const users = new Set(data.map((log: any) => log.user_email)).size;

  return NextResponse.json({ actions, users });
}