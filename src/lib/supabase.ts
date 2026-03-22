import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client per il browser (con anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client per il server (con service role key) - usare solo nelle API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
