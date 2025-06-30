// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ofssokabeqkeydyzndjg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mc3Nva2FiZXFrZXlkeXpuZGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzAyOTgsImV4cCI6MjA2NjUwNjI5OH0.b1JZtMSuv07F_NOMRdXnIeNUyKl1RMAwlDH4HMedFkY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
