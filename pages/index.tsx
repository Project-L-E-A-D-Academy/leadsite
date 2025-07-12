"use client"

import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState('')
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setHasSession(!!session)
    })

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const goToPage = async (path: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push(path)
    } else {
      router.push(`/auth?redirect=${path}`)
    }
  }

  const handleSSCAccess = async () => {
    if (inputCode === 'Eagles123n2024') {
      setShowModal(false)
      const { data: { session } } = await supabase.auth.getSession()
      session ? router.push('/ssc-profile') : router.push(`/auth?redirect=/ssc-profile`)
    } else {
      setError('Incorrect code. Please try again.')
    }
  }

  const views = [
    [
      { label: '🍽️ Nutrition', onClick: () => goToPage('/nutrition') },
      { label: '🧘 Mindfulness', onClick: () => goToPage('/mindfulness') },
    ],
    [
      {
        label: '🗳️ SSC Voting',
        locked: true,
        onClick: () => setShowModal(true),
      },
    ],
  ]

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      
      <LoadingScreen />
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 animate-scaleIn">
            <h2 className="text-xl font-bold mb-4 text-center font-serif">Enter Access Code</h2>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Eagles123n2024"
              className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-red-400 font-sans"
            />
            {error && <p className="text-sm text-red-500 mb-2 font-sans">{error}</p>}
            <button
              onClick={handleSSCAccess}
              className="bg-red-500 text-white w-full py-2 rounded-md hover:bg-red-600 transition-colors duration-300 font-medium"
            >
              Continue
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="text-sm text-gray-500 mt-3 w-full hover:underline font-sans"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-8" style={{
        backgroundColor: '#FFFFFF',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'429\' height=\'429\' viewBox=\'0 0 200 200\'%3E%3Cg fill=\'none\' stroke=\'%23C70000\' stroke-width=\'1\' stroke-opacity=\'0.15\'%3E%3Crect x=\'-40\' y=\'40\' width=\'75\' height=\'75\'/%3E%3Crect x=\'-35\' y=\'45\' width=\'65\' height=\'65\'/%3E%3Crect x=\'-30\' y=\'50\' width=\'55\' height=\'55\'/%3E%3Crect x=\'-25\' y=\'55\' width=\'45\' height=\'45\'/%3E%3Crect x=\'-20\' y=\'60\' width=\'35\' height=\'35\'/%3E%3Crect x=\'-15\' y=\'65\' width=\'25\' height=\'25\'/%3E%3Crect x=\'-10\' y=\'70\' width=\'15\' height=\'15\'/%3E%3Crect x=\'-5\' y=\'75\' width=\'5\' height=\'5\'/%3E%3Crect width=\'35\' height=\'35\'/%3E%3Crect x=\'5\' y=\'5\' width=\'25\' height=\'25\'/%3E%3Crect x=\'10\' y=\'10\' width=\'15\' height=\'15\'/%3E%3Crect x=\'15\' y=\'15\' width=\'5\' height=\'5\'/%3E%3Crect x=\'40\' width=\'75\' height=\'75\'/%3E%3Crect x=\'45\' y=\'5\' width=\'65\' height=\'65\'/%3E%3Crect x=\'50\' y=\'10\' width=\'55\' height=\'55\'/%3E%3Crect x=\'55\' y=\'15\' width=\'45\' height=\'45\'/%3E%3Crect x=\'60\' y=\'20\' width=\'35\' height=\'35\'/%3E%3Crect x=\'65\' y=\'25\' width=\'25\' height=\'25\'/%3E%3Crect x=\'70\' y=\'30\' width=\'15\' height=\'15\'/%3E%3Crect x=\'75\' y=\'35\' width=\'5\' height=\'5\'/%3E%3Crect x=\'40\' y=\'80\' width=\'35\' height=\'35\'/%3E%3Crect x=\'45\' y=\'85\' width=\'25\' height=\'25\'/%3E%3Crect x=\'50\' y=\'90\' width=\'15\' height=\'15\'/%3E%3Crect x=\'55\' y=\'95\' width=\'5\' height=\'5\'/%3E%3Crect x=\'120\' y=\'-40\' width=\'75\' height=\'75\'/%3E%3Crect x=\'125\' y=\'-35\' width=\'65\' height=\'65\'/%3E%3Crect x=\'130\' y=\'-30\' width=\'55\' height=\'55\'/%3E%3Crect x=\'135\' y=\'-25\' width=\'45\' height=\'45\'/%3E%3Crect x=\'140\' y=\'-20\' width=\'35\' height=\'35\'/%3E%3Crect x=\'145\' y=\'-15\' width=\'25\' height=\'25\'/%3E%3Crect x=\'150\' y=\'-10\' width=\'15\' height=\'15\'/%3E%3Crect x=\'155\' y=\'-5\' width=\'5\' height=\'5\'/%3E%3Crect x=\'120\' y=\'40\' width=\'35\' height=\'35\'/%3E%3Crect x=\'125\' y=\'45\' width=\'25\' height=\'25\'/%3E%3Crect x=\'130\' y=\'50\' width=\'15\' height=\'15\'/%3E%3Crect x=\'135\' y=\'55\' width=\'5\' height=\'5\'/%3E%3Crect y=\'120\' width=\'75\' height=\'75\'/%3E%3Crect x=\'5\' y=\'125\' width=\'65\' height=\'65\'/%3E%3Crect x=\'10\' y=\'130\' width=\'55\' height=\'55\'/%3E%3Crect x=\'15\' y=\'135\' width=\'45\' height=\'45\'/%3E%3Crect x=\'20\' y=\'140\' width=\'35\' height=\'35\'/%3E%3Crect x=\'25\' y=\'145\' width=\'25\' height=\'25\'/%3E%3Crect x=\'30\' y=\'150\' width=\'15\' height=\'15\'/%3E%3Crect x=\'35\' y=\'155\' width=\'5\' height=\'5\'/%3E%3Crect x=\'200\' y=\'120\' width=\'75\' height=\'75\'/%3E%3Crect x=\'40\' y=\'200\' width=\'75\' height=\'75\'/%3E%3Crect x=\'80\' y=\'80\' width=\'75\' height=\'75\'/%3E%3Crect x=\'85\' y=\'85\' width=\'65\' height=\'65\'/%3E%3Crect x=\'90\' y=\'90\' width=\'55\' height=\'55\'/%3E%3Crect x=\'95\' y=\'95\' width=\'45\' height=\'45\'/%3E%3Crect x=\'100\' y=\'100\' width=\'35\' height=\'35\'/%3E%3Crect x=\'105\' y=\'105\' width=\'25\' height=\'25\'/%3E%3Crect x=\'110\' y=\'110\' width=\'15\' height=\'15\'/%3E%3Crect x=\'115\' y=\'115\' width=\'5\' height=\'5\'/%3E%3Crect x=\'80\' y=\'160\' width=\'35\' height=\'35\'/%3E%3Crect x=\'85\' y=\'165\' width=\'25\' height=\'25\'/%3E%3Crect x=\'90\' y=\'170\' width=\'15\' height=\'15\'/%3E%3Crect x=\'95\' y=\'175\' width=\'5\' height=\'5\'/%3E%3Crect x=\'120\' y=\'160\' width=\'75\' height=\'75\'/%3E%3Crect x=\'125\' y=\'165\' width=\'65\' height=\'65\'/%3E%3Crect x=\'130\' y=\'170\' width=\'55\' height=\'55\'/%3E%3Crect x=\'135\' y=\'175\' width=\'45\' height=\'45\'/%3E%3Crect x=\'140\' y=\'180\' width=\'35\' height=\'35\'/%3E%3Crect x=\'145\' y=\'185\' width=\'25\' height=\'25\'/%3E%3Crect x=\'150\' y=\'190\' width=\'15\' height=\'15\'/%3E%3Crect x=\'155\' y=\'195\' width=\'5\' height=\'5\'/%3E%3Crect x=\'160\' y=\'40\' width=\'75\' height=\'75\'/%3E%3Crect x=\'165\' y=\'45\' width=\'65\' height=\'65\'/%3E%3Crect x=\'170\' y=\'50\' width=\'55\' height=\'55\'/%3E%3Crect x=\'175\' y=\'55\' width=\'45\' height=\'45\'/%3E%3Crect x=\'180\' y=\'60\' width=\'35\' height=\'35\'/%3E%3Crect x=\'185\' y=\'65\' width=\'25\' height=\'25\'/%3E%3Crect x=\'190\' y=\'70\' width=\'15\' height=\'15\'/%3E%3Crect x=\'195\' y=\'75\' width=\'5\' height=\'5\'/%3E%3Crect x=\'160\' y=\'120\' width=\'35\' height=\'35\'/%3E%3Crect x=\'165\' y=\'125\' width=\'25\' height=\'25\'/%3E%3Crect x=\'170\' y=\'130\' width=\'15\' height=\'15\'/%3E%3Crect x=\'175\' y=\'135\' width=\'5\' height=\'5\'/%3E%3Crect x=\'200\' y=\'200\' width=\'35\' height=\'35\'/%3E%3Crect x=\'200\' width=\'35\' height=\'35\'/%3E%3Crect y=\'200\' width=\'35\' height=\'35\'/%3E%3C/g%3E%3C/svg%3E"), radial-gradient(circle at top left, #b91c1c 0.15%, white 50%)',
        animation: 'gradient-pulse 15s ease infinite'
      }}>
        <div className="border-2 border-red-600 rounded-2xl p-6 w-full max-w-md text-center shadow-xl bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <h1 className="text-xl text-gray-700 mb-1 font-serif tracking-wide">A Heartful Welcoming</h1>
          <h2 className="text-4xl font-bold text-red-700 mb-6 font-dancing">
            <span className="font-playfair font-normal">from </span>
            <span className="text-5xl">L.E.A.D.</span>
          </h2>

          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? views.length - 1 : prev - 1))}
              className="p-2 rounded-full hover:bg-red-50 transition-colors duration-200 animate-bounce-left"
            >
              <ChevronLeft className="w-8 h-8 text-red-500 hover:text-red-700 transition-colors" />
            </button>

            <div className="grid grid-cols-2 gap-4 flex-1 px-4">
              {views[currentIndex].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className={`relative w-full aspect-square text-center flex items-center justify-center bg-white text-gray-800 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${btn.locked ? 'cursor-not-allowed opacity-80' : 'hover:border-red-300'}`}
                  disabled={btn.locked}
                >
                  <span className="text-2xl">{btn.label.split(' ')[0]}</span>
                  <span className="block text-sm mt-1 font-sans font-medium">{btn.label.split(' ').slice(1).join(' ')}</span>
                  {btn.locked && (
                    <span className="absolute top-2 right-2 text-lg">🔒</span>
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % views.length)}
              className="p-2 rounded-full hover:bg-red-50 transition-colors duration-200 animate-bounce-right"
            >
              <ChevronRight className="w-8 h-8 text-red-500 hover:text-red-700 transition-colors" />
            </button>
          </div>
          
          <div className="flex justify-center space-x-2">
            {views.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-red-500 w-4' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes gradient-pulse {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-5px); }
        }
        @keyframes bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        .animate-bounce-left {
          animation: bounce-left 2s infinite;
        }
        .animate-bounce-right {
          animation: bounce-right 2s infinite;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
        .font-dancing {
          font-family: 'Dancing Script', cursive;
        }
        .font-sans {
          font-family: 'Roboto', sans-serif;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </>
  )
}