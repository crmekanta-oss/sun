import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

if (!hasSupabaseEnabled) {
  console.warn('Supabase credentials are not fully set or using placeholders. App will run in offline/mock mode.');
}

class MockQuery {
  from() { return this; }
  select() { return this; }
  insert() { return this; }
  update() { return this; }
  delete() { return this; }
  eq() { return this; }
  in() { return this; }
  order() { return this; }
  single() { return this; }
  maybeSingle() { return this; }
  upsert() { return this; }
  then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); }
  catch() { return this; }
}

class MockChannel {
  constructor() { this._presence = true; }
  on() { return this; }
  subscribe(cb) { if (typeof cb === 'function') cb('SUBSCRIBED'); return this; }
  track() { return this; }
  presenceState() { return {}; }
}

class MockStorageBucket {
  upload() { return Promise.resolve({ data: null, error: null }); }
  getPublicUrl() { return { data: { publicUrl: '' }, error: null }; }
}

const mockSupabase = {
  channel: () => new MockChannel(),
  removeChannel: () => {},
  from: () => new MockQuery(),
  storage: {
    from: () => new MockStorageBucket(),
  },
};

export { hasSupabaseEnabled };
export const supabase = hasSupabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;
