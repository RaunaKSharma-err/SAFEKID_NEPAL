import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zncrwicvtvyqtatngaym.supabase.co"
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuY3J3aWN2dHZ5cXRhdG5nYXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NjU1NzgsImV4cCI6MjA3MzI0MTU3OH0.V-AeOE_LDZMWpk9kgXKLPcD-JkbBR33t0RyhJ9tvYQY"

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})