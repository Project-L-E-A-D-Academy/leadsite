import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import Image from 'next/image'

interface SSCProfile {
  user_id: string
  email: string
  role: string
  description: string
  profile_url: string
  team: string | null
}

export default function SSCVoting() {
  const [profile, setProfile] = useState<SSCProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [vote, setVote] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/auth?redirect=/ssc-voting')
        return
      }

      const { data, error } = await supabase
        .from('ssc_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
      } else {
        setProfile(data)
      }

      setLoading(false)
    }

    getProfile()
  }, [router]) // ✅ include router as dependency

  const handleVote = async () => {
    if (!vote) return alert('Please select a candidate.')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('ssc_votes').insert({
      user_id: user?.id,
      vote,
    })

    if (error) {
      alert('Voting failed. You may have already voted.')
      return
    }

    alert('Vote submitted successfully!')
  }

  if (loading) return <p className="text-center mt-20">Loading profile...</p>
  if (!profile) return <p className="text-center mt-20">No profile found.</p>

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-red-600">SSC Voting</h1>
          <p className="text-gray-600">Welcome, {profile.description}</p>
          <p className="text-sm text-gray-500">Role: {profile.role} | Team: {profile.team || 'None'}</p>
        </div>
        {profile.profile_url && (
          <Image
            src={profile.profile_url}
            alt="Profile"
            width={56}
            height={56}
            className="rounded-full object-cover border-2 border-red-500"
          />
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <label className="block font-semibold text-gray-700">Select Candidate</label>
        <select
          value={vote}
          onChange={(e) => setVote(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">-- Select --</option>
          <option value="Candidate A">Candidate A</option>
          <option value="Candidate B">Candidate B</option>
          <option value="Candidate C">Candidate C</option>
        </select>

        <button
          onClick={handleVote}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
        >
          Submit Vote
        </button>
      </div>
    </main>
  )
}
