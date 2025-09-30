import { supabase } from '../supabase';

export class AuthService {
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data.user) await this.logAction(email, 'signup');
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.user) await this.logAction(email, 'signin');
    return { data, error };
  }

  static async getItems(token: string) {
    const { data: user } = await supabase.auth.getUser(token);
    if (!user.user) throw new Error('Unauthorized');
    const { data, error } = await supabase.from('items').select('*').eq('email', user.user.email);
    await this.logAction(user.user.email, 'view_items');
    return { data, error };
  }

  static async logAction(userEmail: string, action: string) {
    await supabase.from('audit_logs').insert({
      user_email: userEmail,
      action,
      details: '{}',
      timestamp: new Date().toISOString()
    });
  }
}