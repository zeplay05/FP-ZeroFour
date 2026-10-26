import { createClient } from '@supabase/supabase-js';

// Environment variables from Vite (.env or Vercel environment variables)
const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  ''
).trim();

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  ''
).trim();

/**
 * Checks if Supabase credentials are provided and valid
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your_supabase_project_url') &&
    !supabaseAnonKey.includes('your_supabase_anon_key')
  );
};

// Initialize client if credentials exist, otherwise null
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Map Supabase database row to frontend round object
 */
const mapDbToRound = (row) => ({
  id: row.id,
  title: row.title || '',
  roundName: row.round_name || row.title || '',
  pricePerNumber: Number(row.price_per_number) || 0,
  coverImage: row.cover_image || null,
  gradient: row.gradient || 'indigo',
  theme: row.theme || 'neon',
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  status: row.status || 'open',
  winningNumber: row.winning_number || '',
  numbers: Array.isArray(row.numbers) ? row.numbers : [],
  bookings: Array.isArray(row.bookings) ? row.bookings : []
});

/**
 * Map frontend round object to Supabase database row
 */
const mapRoundToDb = (round) => ({
  id: round.id,
  title: round.title || round.roundName || '',
  round_name: round.roundName || round.title || '',
  price_per_number: Number(round.pricePerNumber) || 0,
  cover_image: round.coverImage || null,
  gradient: round.gradient || 'indigo',
  theme: round.theme || 'neon',
  status: round.status || 'open',
  winning_number: round.winningNumber || '',
  numbers: round.numbers || [],
  bookings: round.bookings || [],
  updated_at: new Date().toISOString()
});

/**
 * Map Supabase database row to frontend store card object
 */
const mapDbToStoreCard = (row) => ({
  id: row.id,
  title: row.title || '',
  subtitle: row.subtitle || '',
  grade: row.grade || 'PCG 10',
  price: Number(row.price) || 0,
  status: row.status || 'available',
  coverImage: row.cover_image || '',
  detailImages: Array.isArray(row.detail_images) ? row.detail_images : [],
  videoUrl: row.video_url || '',
  cert: row.cert || '',
  description: row.description || '',
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
});

/**
 * Map frontend store card object to Supabase database row
 */
const mapStoreCardToDb = (card) => ({
  id: card.id,
  title: card.title || '',
  subtitle: card.subtitle || '',
  grade: card.grade || 'PCG 10',
  price: Number(card.price) || 0,
  status: card.status || 'available',
  cover_image: card.coverImage || '',
  detail_images: card.detailImages || [],
  video_url: card.videoUrl || '',
  cert: card.cert || '',
  description: card.description || '',
  updated_at: new Date().toISOString()
});

// ==========================================
// SUPABASE API METHODS: LOTTERY ROUNDS
// ==========================================

export async function fetchRoundsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('lottery_rounds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching rounds:', error);
      return null;
    }
    return data ? data.map(mapDbToRound) : [];
  } catch (err) {
    console.error('[Supabase] Exception fetching rounds:', err);
    return null;
  }
}

export async function upsertRoundToSupabase(round) {
  if (!supabase || !round) return false;
  try {
    const row = mapRoundToDb(round);
    const { error } = await supabase
      .from('lottery_rounds')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error upserting round:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception upserting round:', err);
    return false;
  }
}

export async function upsertAllRoundsToSupabase(rounds) {
  if (!supabase || !Array.isArray(rounds) || rounds.length === 0) return false;
  try {
    const rows = rounds.map(mapRoundToDb);
    const { error } = await supabase
      .from('lottery_rounds')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error upserting all rounds:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception upserting all rounds:', err);
    return false;
  }
}

export async function deleteRoundFromSupabase(roundId) {
  if (!supabase || !roundId) return false;
  try {
    const { error } = await supabase
      .from('lottery_rounds')
      .delete()
      .eq('id', roundId);

    if (error) {
      console.error('[Supabase] Error deleting round:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception deleting round:', err);
    return false;
  }
}

export async function syncRoundsWithSupabase(nextRounds, prevRounds = []) {
  if (!supabase || !Array.isArray(nextRounds)) return false;
  try {
    const nextIds = new Set(nextRounds.map(r => r.id));
    const deletedIds = (prevRounds || []).filter(r => !nextIds.has(r.id)).map(r => r.id);
    for (const delId of deletedIds) {
      await deleteRoundFromSupabase(delId);
    }
    if (nextRounds.length > 0) {
      return await upsertAllRoundsToSupabase(nextRounds);
    }
    return true;
  } catch (err) {
    console.error('[Supabase] syncRoundsWithSupabase error:', err);
    return false;
  }
}


// ==========================================
// SUPABASE API METHODS: STORE CARDS
// ==========================================

export async function fetchStoreCardsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('store_cards')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching store cards:', error);
      return null;
    }
    return data ? data.map(mapDbToStoreCard) : [];
  } catch (err) {
    console.error('[Supabase] Exception fetching store cards:', err);
    return null;
  }
}

export async function upsertStoreCardToSupabase(card) {
  if (!supabase || !card) return false;
  try {
    const row = mapStoreCardToDb(card);
    const { error } = await supabase
      .from('store_cards')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error upserting store card:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception upserting store card:', err);
    return false;
  }
}

export async function upsertAllStoreCardsToSupabase(cards) {
  if (!supabase || !Array.isArray(cards) || cards.length === 0) return false;
  try {
    const rows = cards.map(mapStoreCardToDb);
    const { error } = await supabase
      .from('store_cards')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error upserting all store cards:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception upserting all store cards:', err);
    return false;
  }
}

export async function deleteStoreCardFromSupabase(cardId) {
  if (!supabase || !cardId) return false;
  try {
    const { error } = await supabase
      .from('store_cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('[Supabase] Error deleting store card:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception deleting store card:', err);
    return false;
  }
}

export async function syncStoreCardsWithSupabase(nextCards, prevCards = []) {
  if (!supabase || !Array.isArray(nextCards)) return false;
  try {
    const nextIds = new Set(nextCards.map(c => c.id));
    const deletedIds = (prevCards || []).filter(c => !nextIds.has(c.id)).map(c => c.id);
    for (const delId of deletedIds) {
      await deleteStoreCardFromSupabase(delId);
    }
    if (nextCards.length > 0) {
      return await upsertAllStoreCardsToSupabase(nextCards);
    }
    return true;
  } catch (err) {
    console.error('[Supabase] syncStoreCardsWithSupabase error:', err);
    return false;
  }
}

// ==========================================
// SUPABASE API METHODS: APP SETTINGS
// ==========================================

export async function fetchSettingFromSupabase(key) {
  if (!supabase || !key) return null;
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`[Supabase] Error fetching setting ${key}:`, error);
      return null;
    }
    return data ? data.value : null;
  } catch (err) {
    console.error(`[Supabase] Exception fetching setting ${key}:`, err);
    return null;
  }
}

export async function saveSettingToSupabase(key, value) {
  if (!supabase || !key) return false;
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.error(`[Supabase] Error saving setting ${key}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] Exception saving setting ${key}:`, err);
    return false;
  }
}

// ==========================================
// REALTIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to realtime changes on lottery_rounds table
 */
export function subscribeToRealtimeRounds(onChange) {
  if (!supabase) return () => {};
  
  const channel = supabase
    .channel('public:lottery_rounds')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_rounds' }, (payload) => {
      if (onChange) onChange(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to realtime changes on store_cards table
 */
export function subscribeToRealtimeStoreCards(onChange) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:store_cards')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_cards' }, (payload) => {
      if (onChange) onChange(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
