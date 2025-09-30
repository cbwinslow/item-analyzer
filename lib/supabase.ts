import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

export const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});