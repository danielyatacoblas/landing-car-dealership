'use client';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON || '';

async function post(table: string, row: Record<string, unknown>) {
  if (!URL || !KEY) return { ok: false as const, reason: 'no-config' as const };
  try {
    const r = await fetch(`${URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false as const, reason: 'network' as const, error: String(e) };
  }
}

export const sb = {
  leads: (email: string, source: string) => post('leads', { email, source, created_at: new Date().toISOString() }),
  events: (name: string, data: unknown) => post('events', { name, data, created_at: new Date().toISOString() }),
  abHero: (variant: string, action: string) => post('ab_hero', { variant, action, created_at: new Date().toISOString() }),
};
