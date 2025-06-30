import { useRouter } from 'next/router'
import LoadingScreen from '@/components/LoadingScreen'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  const goToLogin = (redirectTo: string) => {
    router.push(`/auth?redirect=${redirectTo}`)
  }

  return (
    <div className="relative min-h-screen">
      {/* Paper texture background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/paper-texture.png"
          alt="Paper Background"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>

      {/* Loading screen */}
      <LoadingScreen />

      {/* Main content */}
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Wellness Hub</h1>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => goToLogin('/nutrition')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            🍽️ Nutrition & Recipes
          </button>

          <button
            onClick={() => goToLogin('/mindfulness')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            🧘 Mindfulness & Meditation
          </button>
        </div>
      </main>
    </div>
  )
}
