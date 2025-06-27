import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function MindfulnessPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        router.push('/auth?redirect=/mindfulness')
      } else {
        setUserEmail(data.session.user.email)
      }
    }

    checkSession()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth?redirect=/mindfulness')
  }

  return (
    <main className="min-h-screen px-4 py-8 bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">🧘 Mindfulness Zone</h1>
      {userEmail && (
        <p className="mb-4 text-gray-700">Welcome, {userEmail}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card title="Guided Meditation" description="Relax and refocus with guided sessions." />
        <Card title="Breathing Exercises" description="Practice calming breathwork techniques." />
        <Card title="Sleep Stories" description="Listen to calming bedtime stories." />
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </main>
  )
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-white shadow hover:shadow-md transition">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
