const { createClient } = require('@supabase/supabase-js');

let _supabase = null;

/**
 * Returns a Supabase client if env vars are set, otherwise null.
 * Null → graceful fallback to JSON file storage.
 */
function getSupabase() {
    if (_supabase) return _supabase;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return null;
    _supabase = createClient(url, key, {
        auth: { persistSession: false }
    });
    return _supabase;
}

module.exports = { getSupabase };
