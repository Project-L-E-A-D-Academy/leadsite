// lib/nutrition.ts
import { supabase } from './supabase'

export async function addNutritionLog({ user_id, preference, meals, notes, calories }: {
  user_id: string
  preference: string
  meals: string[]
  notes?: string
  calories?: number
}) {
  const { error } = await supabase.from('nutrition_logs').insert([
    {
      user_id,
      preference,
      meals,
      notes,
      calories
    }
  ])

  return { error }
}
