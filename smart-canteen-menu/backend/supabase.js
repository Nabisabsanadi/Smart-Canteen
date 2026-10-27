const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Warning: SUPABASE_URL or SUPABASE_KEY missing in environment variables.");
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: { persistSession: false },
    realtime: {
      transport: WebSocket, // Required for Node.js < 22
    },
  }
);

module.exports = supabase;