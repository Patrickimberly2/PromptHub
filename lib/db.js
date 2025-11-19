/**
 * Supabase Database Connection
 *
 * This module provides a configured Supabase client for database operations.
 * Replaces the previous local PostgreSQL connection.
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable session persistence for server-side usage
  },
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
}
