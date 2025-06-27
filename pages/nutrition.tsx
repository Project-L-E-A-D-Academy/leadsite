// pages/nutrition.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function NutritionPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.push('/auth?redirect=/nutrition') // Not logged in, redirect to login
      } else {
        setUserEmail(data?.user?.email ?? null)
      }
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/') // Back to home after logout
  }

  if (!userEmail) return <p className="p-4">Loading nutrition page...</p>

  return (
    <main className="min-h-screen p-6 bg-lime-50 text-gray-800 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">🍽️ Personalized Nutrition</h1>
      <p className="mb-6">Welcome, <strong>{userEmail}</strong>!</p>

      <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md text-center">
        <p className="mb-2">This is your nutrition dashboard.</p>
        <p>Here you’ll later see meal plans, food preferences, and more!</p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        🚪 Logout
      </button>
    </main>
  )
}
