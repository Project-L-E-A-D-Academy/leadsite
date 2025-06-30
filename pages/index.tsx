// pages/index.tsx
import { useRouter } from 'next/router'
import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState('')

  const goToLogin = (redirectTo: string) => {
    router.push(`/auth?redirect=${redirectTo}`)
  }

  const handleSSCAccess = () => {
    if (inputCode === 'Eagles123n2024') {
      setShowModal(false)
      router.push('/ssc-profile') // We'll create this page next
    } else {
      setError('Incorrect code. Please try again.')
    }
  }

  return (
    <>
      <LoadingScreen />

      <main className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-6 w-80">
              <h2 className="text-xl font-bold mb-4 text-center">Enter Access Code</h2>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Eagles123n2024"
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
              <button
                onClick={handleSSCAccess}
                className="bg-red-500 text-white w-full py-2 rounded-md hover:bg-red-600"
              >
                Continue
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 mt-3 w-full hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Wellness Hub</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <button
            onClick={() => goToLogin('/nutrition')}
            className="bg-green-500 text-white px-6 py-6 rounded-2xl hover:bg-green-600 font-medium shadow-md"
          >
            🍽️ Nutrition & Recipes
          </button>

          <button
            onClick={() => goToLogin('/mindfulness')}
            className="bg-blue-500 text-white px-6 py-6 rounded-2xl hover:bg-blue-600 font-medium shadow-md"
          >
            🧘 Mindfulness & Meditation
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 text-white px-6 py-6 rounded-2xl hover:bg-red-600 font-medium shadow-md col-span-1 sm:col-span-2"
          >
            🗳️ SSC Voting
          </button>
        </div>
      </main>
    </>
  )
}
