import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { redirect } = router.query

  // 🔁 Redirect on session sign in
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH EVENT]', event)

      if (event === 'SIGNED_IN' && session) {
        const path = typeof redirect === 'string' ? redirect : '/'
        router.push(path)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, redirect])

  const handleAuth = async (type: 'sign-in' | 'sign-up') => {
    setError('')
    let result

    if (!email || !password) {
      setError('Please fill in both email and password.')
      return
    }

    if (type === 'sign-in') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }

    if (result.error) {
      console.error(`${type} failed`, result.error.message)
      setError(result.error.message)
    } else {
      console.log(`${type} success`, result)
      // session will trigger redirect
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Login or Sign Up</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded mb-2 w-full max-w-xs"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded mb-4 w-full max-w-xs"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="flex gap-4">
        <button
          onClick={() => handleAuth('sign-in')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
        <button
          onClick={() => handleAuth('sign-up')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </div>
    </main>
  )
}
