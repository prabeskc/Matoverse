const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('YOUR_SUPABASE_SERVICE_ROLE_KEY')) {
  console.warn('⚠️  Supabase environment variables are missing or not configured.');
}

// Create a single supabase client instance for reuse across the app
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Don't persist session in server environment
    autoRefreshToken: false,
  },
});

module.exports = supabase;
