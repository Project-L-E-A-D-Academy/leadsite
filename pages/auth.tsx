<<<<<<< HEAD
// pages/auth.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const JigsawPuzzle = dynamic(() => import('@/components/JigsawPuzzle'), { ssr: false });

export default function AuthPage() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [grade, setGrade] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgPosition, setBgPosition] = useState('0% 0%');

  const router = useRouter();
  const { redirect } = router.query;

  useEffect(() => {
    setIsLoaded(true);
    
    const animateBg = () => {
      setBgPosition(`${Math.random() * 100}% ${Math.random() * 100}%`);
    };
    const interval = setInterval(animateBg, 15000);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const path = typeof redirect === 'string' ? redirect : '/';
        router.push(path);
      }
    });
    
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [router, redirect]);

  const handleAuth = async () => {
    setError('');

    if (!email || !password || !confirmPassword || !username || !grade || !birthday) {
      setError('Please fill in all the fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!puzzleSolved) {
      setError('Please solve the puzzle to continue.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, birthday, grade }
      }
    });

    if (error) setError(error.message);
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter email and password.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      
      <main 
        className={`flex flex-col items-center justify-center min-h-screen px-4 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundColor: '#FFFFFF',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'411\' height=\'411\' viewBox=\'0 0 800 800\'%3E%3Cg fill=\'none\' stroke=\'%23BE0606\' stroke-width=\'1\' stroke-opacity=\'0.2\'%3E%3Cpath d=\'M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63\'/%3E%3Cpath d=\'M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764\'/%3E%3Cpath d=\'M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880\'/%3E%3Cpath d=\'M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382\'/%3E%3Cpath d=\'M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269\'/%3E%3C/g%3E%3Cg fill=\'%23B60000\' fill-opacity=\'0.2\'%3E%3Ccircle cx=\'769\' cy=\'229\' r=\'6\'/%3E%3Ccircle cx=\'539\' cy=\'269\' r=\'6\'/%3E%3Ccircle cx=\'603\' cy=\'493\' r=\'6\'/%3E%3Ccircle cx=\'731\' cy=\'737\' r=\'6\'/%3E%3Ccircle cx=\'520\' cy=\'660\' r=\'6\'/%3E%3Ccircle cx=\'309\' cy=\'538\' r=\'6\'/%3E%3Ccircle cx=\'295\' cy=\'764\' r=\'6\'/%3E%3Ccircle cx=\'40\' cy=\'599\' r=\'6\'/%3E%3Ccircle cx=\'102\' cy=\'382\' r=\'6\'/%3E%3Ccircle cx=\'127\' cy=\'80\' r=\'6\'/%3E%3Ccircle cx=\'370\' cy=\'105\' r=\'6\'/%3E%3Ccircle cx=\'578\' cy=\'42\' r=\'6\'/%3E%3Ccircle cx=\'237\' cy=\'261\' r=\'6\'/%3E%3Ccircle cx=\'390\' cy=\'382\' r=\'6\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundPosition: bgPosition,
          transition: 'background-position 10s ease-in-out'
        }}
      >
        <div className={`bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-2 border-red-600/20 backdrop-blur-sm transition-all duration-500 ${isLoaded ? 'translate-y-0' : 'translate-y-10'} animate-bounce-in`}>
          <h1 className="text-3xl font-bold mb-6 text-center text-red-700 font-serif">
            {mode === 'sign-in' ? 'Welcome Back' : 'Join L.E.A.D.'}
          </h1>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="border-2 border-gray-200 pl-10 p-3 rounded-lg w-full focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 font-sans"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 pointer-events-none">
               ✉️
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="border-2 border-gray-200 pl-10 p-3 rounded-lg w-full focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 font-sans"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 pointer-events-none">
                🔒
              </span>
            </div>

            {mode === 'sign-up' && (
              <>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="border-2 border-gray-200 pl-10 p-3 rounded-lg w-full focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 font-sans"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 pointer-events-none">
                    🔒
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    className="border-2 border-gray-200 pl-10 p-3 rounded-lg w-full focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 font-sans"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 pointer-events-none">
                    👤
                  </span>
                </div>

                <div className="relative">
                  <select
                    className="border-2 border-gray-200 pl-10 p-3 rounded-lg w-full focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 font-sans appearance-none"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="">Select Grade Level</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={`Grade ${i + 1}`}>{`Grade ${i + 1}`}</option>
                    ))}
                  </select>
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 pointer-events-none">
                    🎓
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    placeholder="Birthday"
                    className="border-2 border-gray-200 pl-10 p-3 rounded-lg w-full focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 font-sans"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 pointer-events-none">
                    🎂
                  </span>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg animate-shake">
                <p className="text-red-700 font-medium font-sans">{error}</p>
              </div>
            )}

            {mode === 'sign-up' && email && password && confirmPassword && username && grade && birthday && !puzzleSolved && (
              <div className="mb-4 flex justify-center animate-fade-in">
                <JigsawPuzzle
                  imageUrl="https://i.imgur.com/vF0iFJ1.jpeg"
                  onSolved={() => setPuzzleSolved(true)}
                />
              </div>
            )}

            <button
              className="bg-red-600 text-white px-6 py-3 rounded-lg w-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md font-medium font-sans"
              onClick={mode === 'sign-in' ? handleLogin : handleAuth}
            >
              {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="text-sm text-center mt-4 font-sans">
              {mode === 'sign-in' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    className="text-red-600 hover:underline font-medium" 
                    onClick={() => {
                      setMode('sign-up');
                      setError('');
                    }}
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    className="text-red-600 hover:underline font-medium" 
                    onClick={() => {
                      setMode('sign-in');
                      setError('');
                    }}
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce-in {
          0% { transform: translateY(30px); opacity: 0; }
          60% { transform: translateY(-10px); opacity: 1; }
          80% { transform: translateY(5px); }
          100% { transform: translateY(0px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-sans {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
    </>
  );
}
=======
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
>>>>>>> 701f7830381713c77d9d2c4cd32db968cd2cc904
