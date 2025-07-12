<<<<<<< HEAD
// pages/mindfulness.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { useProgress, ProgressProvider } from '../components/ProgressContext';

const MEDITATION_VIDEOS = [
  {
    id: "video-1",
    title: "Mindful Breathing (5 min)",
    url: "https://www.youtube.com/embed/SEfs5TJZ6Nk",
    duration: 5,
    description: "Calm your mind with focused breathing techniques"
  },
  {
    id: "video-2",
    title: "Body Scan Meditation (7 min)",
    url: "https://www.youtube.com/embed/wGFog-o1x8I",
    duration: 7,
    description: "Release tension through systematic body awareness"
  },
  {
    id: "video-3",
    title: "Loving Kindness (10 min)",
    url: "https://www.youtube.com/embed/sTANio_2E0Q",
    duration: 10,
    description: "Cultivate compassion for yourself and others"
  },
];

export default function MindfulnessPage() {
  return (
    <ProgressProvider>
      <MindfulnessDashboard />
    </ProgressProvider>
  );
}

function MindfulnessDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgPulse, setBgPulse] = useState(0);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [showTherapyModal, setShowTherapyModal] = useState(false);
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const {
    breathingStreak,
    unlockedLevels = [],
    breathingBadge,
    meditationMonkBadge,
    therapyBadge,
    saveTherapySession,
    increment
  } = useProgress();

  useEffect(() => {
    setIsLoaded(true);
    
    const interval = setInterval(() => {
      setBgPulse(prev => (prev + 1) % 2);
    }, 8000);

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push('/auth?redirect=/mindfulness');
      } else {
        setUserEmail(data.session?.user?.email ?? null);
        const user = data.session.user;

        // Load meditation progress
        const { data: meditationData } = await supabase
          .from('mindfulness_sessions')
          .select('video_id')
          .eq('user_id', user.id)
          .eq('type', 'meditation');

        if (meditationData) {
          setCompletedVideos(meditationData.map(v => v.video_id).filter(Boolean));
        }

        // Load therapy conversations
        const { data: therapyData } = await supabase
          .from('therapy_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (therapyData && therapyData.length > 0) {
          const therapyConv = [];
          for (const session of therapyData) {
            if (session.user_message) {
              therapyConv.push({ role: 'user', content: session.user_message });
            }
            if (session.ai_response) {
              therapyConv.push({ role: 'assistant', content: session.ai_response });
            }
          }
          setConversation(therapyConv);
        }

        // Load session logs
        const [breathingRes, otherRes, therapyRes] = await Promise.all([
          supabase.from("breathing_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("mindfulness_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("therapy_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        ]);

        const breathingSessions = breathingRes.data?.map(s => ({ ...s, type: "breathing" })) || [];
        const otherSessions = otherRes.data || [];
        const therapySessions = therapyRes.data?.map(s => ({ ...s, type: "therapy" })) || [];

        setSessionLogs([...breathingSessions, ...otherSessions, ...therapySessions].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    };

    checkSession();
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth?redirect=/mindfulness');
  };

  const handleVideoComplete = async (videoId: string) => {
    if (!completedVideos.includes(videoId)) {
      const newCompleted = [...completedVideos, videoId];
      setCompletedVideos(newCompleted);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const video = MEDITATION_VIDEOS.find(v => v.id === videoId);
        
        await supabase.from('mindfulness_sessions').insert([{
          user_id: user.id,
          type: 'meditation',
          video_id: videoId,
          duration: video?.duration,
          note: `Completed ${video?.title}`
        }]);

        if (newCompleted.length === MEDITATION_VIDEOS.length) {
          await increment('meditation', { monkBadge: true });
        }
      }
    }
    setPlayingVideo(null);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    setIsAiThinking(true);
    const newConversation = [...conversation, {role: 'user', content: userMessage}];
    setConversation(newConversation);
    setUserMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await saveTherapySession(userMessage, '');

      const response = await axios.post('/api/chat', {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content: "You are a compassionate AI therapist specializing in mindfulness and mental wellness. Provide brief, supportive responses (2-3 sentences max) to help users with their emotional needs."
          },
          ...newConversation.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ]
      }, {
        timeout: 15000
      });

      const aiResponse = response.data.choices[0].message.content;
      
      await saveTherapySession(userMessage, aiResponse);
      setConversation(prev => [...prev, {role: 'assistant', content: aiResponse}]);
      
      if (conversation.length >= 4) {
        await increment('therapy', { therapyBadge: true });
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      let errorMessage = "Sorry, I'm having trouble responding right now. Please try again later.";
      
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage = "Server error occurred. Please try again later.";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
      }

      setConversation(prev => [...prev, {role: 'assistant', content: errorMessage}]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const goToBreathing = () => router.push('/mindfulness/breathing');
  const goToStories = () => router.push('/mindfulness/sleep-stories');

  return (
    <>
      <Head>
        <title>Mindfulness Zone</title>
      </Head>
      
      <main 
        className={`min-h-screen px-4 py-8 flex flex-col items-center transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundColor: '#FFFFFF',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' %3E%3Cdefs%3E%3ClinearGradient id=\'a\' x1=\'0\' x2=\'0\' y1=\'0\' y2=\'1\' gradientTransform=\'rotate(7,0.5,0.5)\'%3E%3Cstop offset=\'0\' stop-color=\'%23BF10DC\'/%3E%3Cstop offset=\'1\' stop-color=\'%23FFFFFF\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id=\'b\' width=\'33\' height=\'33\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle fill=\'%23FFFFFF\' cx=\'16.5\' cy=\'16.5\' r=\'16.5\'/%3E%3C/pattern%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23a)\'/%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23b)\' fill-opacity=\'0.07\'/%3E%3C/svg%3E")',
          backgroundAttachment: 'fixed',
          opacity: bgPulse ? 0.98 : 1,
          transition: 'opacity 3s ease-in-out'
        }}
      >
        <div className={`w-full max-w-4xl rounded-2xl bg-white/90 shadow-xl p-8 mb-6 flex flex-col items-center backdrop-blur-sm transition-all duration-500 ${isLoaded ? 'translate-y-0' : 'translate-y-10'} animate-bounce-in`}>
          <div className="flex justify-between w-full mb-6">
            <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center">
              ← Back to Menu
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
            >
              Logout
            </button>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-purple-800 font-serif rounded-xl animate-float">
            🧘 Mindfulness Zone
          </h1>
          
          {userEmail && (
            <p className="mb-6 text-gray-700 font-medium font-sans bg-purple-50 px-4 py-2 rounded-full shadow-inner">
              Welcome, <span className="text-purple-600">{userEmail}</span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col min-h-[250px] w-full border-2 border-green-100 hover:border-green-200 animate-card-hover">
              <h2 className="text-2xl font-semibold mb-3 text-green-700 font-serif">Breathing Exercises</h2>
              
              <div className="mb-4 text-gray-700 font-sans">
                <div className="flex items-center mb-1">
                  <span className="w-6">📊</span>
                  <span>Unlocked: <span className="font-bold text-green-600">{unlockedLevels.length}/5</span> levels</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6">🔥</span>
                  <span>Streak: <span className="font-bold text-orange-600">{breathingStreak} days</span></span>
                </div>
              </div>

              {breathingBadge && (
                <div className="mb-4 text-yellow-700 bg-yellow-100/80 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center">
                  <span className="text-lg mr-2">🏅</span> Level 5 Master
                </div>
              )}

              <button
                onClick={goToBreathing}
                className="mt-auto px-4 py-2.5 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center"
              >
                <span className="mr-2">🌬️</span> Try Breathing
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col min-h-[250px] w-full border-2 border-purple-100 hover:border-purple-200 animate-card-hover" style={{animationDelay: '0.2s'}}>
              <h2 className="text-2xl font-semibold mb-3 text-purple-700 font-serif">Guided Meditation</h2>
              
              <p className="text-gray-700 mb-4 font-sans flex items-start">
                <span className="text-xl mr-2">🪷</span>
                Watch meditation videos to relax and unlock rewards.
              </p>
              
              {meditationMonkBadge && (
                <div className="mb-4 text-yellow-700 bg-yellow-100/80 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center">
                  <span className="text-lg mr-2">🧘</span> Meditation Monk
                </div>
              )}
              
              <button
                onClick={() => setShowMeditationModal(true)}
                className="mt-auto px-4 py-2.5 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center"
              >
                <span className="mr-2">🕉️</span> Start Meditation
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col min-h-[250px] w-full border-2 border-blue-100 hover:border-blue-200 animate-card-hover" style={{animationDelay: '0.4s'}}>
              <h2 className="text-2xl font-semibold mb-3 text-blue-700 font-serif">Sleep Stories</h2>
              
              <p className="text-gray-700 mb-6 font-sans flex items-start">
                <span className="text-xl mr-2">🌙</span>
                Listen to calming bedtime stories and music.
              </p>
              
              <button
                onClick={goToStories}
                className="mt-auto px-4 py-2.5 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center"
              >
                <span className="mr-2">💤</span> Sleep Stories
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col min-h-[250px] w-full border-2 border-indigo-100 hover:border-indigo-200 animate-card-hover" style={{animationDelay: '0.6s'}}>
              <h2 className="text-2xl font-semibold mb-3 text-indigo-700 font-serif">AI Therapy</h2>
              
              <p className="text-gray-700 mb-4 font-sans flex items-start">
                <span className="text-xl mr-2">🤖</span>
                Talk to our compassionate AI therapist about anything on your mind.
              </p>
              
              {therapyBadge && (
                <div className="mb-4 text-yellow-700 bg-yellow-100/80 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center">
                  <span className="text-lg mr-2">💬</span> Therapy Regular
                </div>
              )}
              
              <button
                onClick={() => setShowTherapyModal(true)}
                className="mt-auto px-4 py-2.5 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center"
              >
                <span className="mr-2">🧠</span> Start Therapy
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-purple-700 mt-12 mb-4 w-full text-left font-serif flex items-center">
            <span className="mr-2">🗂</span> Recent Mindfulness Logs
          </h2>
          
          <div className="w-full bg-white/90 p-6 rounded-xl shadow-inner max-h-96 overflow-y-auto border border-purple-100 animate-fade-in">
            {sessionLogs.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">No mindfulness logs yet. Start your journey!</p>
            ) : (
              <ul className="space-y-4">
                {sessionLogs.map((s, i) => (
                  <li 
                    key={i} 
                    className="border-b border-purple-100 pb-3 last:border-0 hover:bg-purple-50/50 transition-colors duration-200 px-3 py-2 rounded-lg"
                  >
                    <div className="flex items-start">
                      <span className="text-xl mr-3 mt-1">
                        {s.type === "breathing" ? "🫁" : 
                         s.type === "meditation" ? "🧘" : 
                         s.type === "therapy" ? "🤖" : "🌙"}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-purple-700 font-sans">
                          {s.type === "breathing" ? "Breathing" : 
                           s.type === "meditation" ? "Meditation" : 
                           s.type === "therapy" ? "Therapy Session" : "Sleep Story"}
                          <span className="text-gray-500 text-xs ml-3 font-normal">
                            {new Date(s.created_at).toLocaleString()}
                          </span>
                        </div>
                        {s.note && (
                          <div className="text-gray-700 mt-1 text-sm bg-purple-50/30 rounded px-2 py-1 inline-block">
                            📝 {s.note}
                          </div>
                        )}
                        {s.user_message && (
                          <div className="text-gray-700 mt-1 text-sm bg-indigo-50/30 rounded px-2 py-1">
                            💬 You: {s.user_message}
                          </div>
                        )}
                        {s.ai_response && (
                          <div className="text-gray-700 mt-1 text-sm bg-green-50/30 rounded px-2 py-1">
                            🤖 AI: {s.ai_response}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {s.level && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              Level: {s.level}
                            </span>
                          )}
                          {s.streak && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              🔥 Streak: {s.streak}
                            </span>
                          )}
                          {s.video_id && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              🎬 Video: {s.video_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Meditation Modal */}
        {showMeditationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-enter">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-purple-800 font-serif">Guided Meditation</h2>
                  <button 
                    onClick={() => setShowMeditationModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {MEDITATION_VIDEOS.map(video => (
                    <div key={video.id} className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
                      <h3 className="font-bold text-xl mb-2 text-purple-700">{video.title}</h3>
                      <p className="text-gray-600 mb-4">{video.description}</p>
                      
                      <button
                        onClick={() => setPlayingVideo(video.id)}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                          completedVideos.includes(video.id)
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : playingVideo === video.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {completedVideos.includes(video.id) 
                          ? '✓ Completed' 
                          : playingVideo === video.id 
                          ? '⏸️ Pause' 
                          : '▶️ Play'}
                      </button>

                      {playingVideo === video.id && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                          <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={`${video.url}?autoplay=1`}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={video.title}
                            />
                          </div>
                          
                          <button
                            onClick={() => handleVideoComplete(video.id)}
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                          >
                            Mark as Completed
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <div className="text-lg font-bold text-purple-800 mb-2">
                    Progress: {completedVideos.length}/{MEDITATION_VIDEOS.length} completed
                  </div>
                  {meditationMonkBadge && (
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                      <span className="text-xl mr-2">🏆</span> Meditation Master Unlocked!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Therapy Modal */}
        {showTherapyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-modal-enter">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-indigo-700 font-serif">AI Therapy Session</h2>
                  <button 
                    onClick={() => setShowTherapyModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {conversation.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-2 text-lg font-medium">Hello! I'm here to listen and help.</p>
                    <p>What's on your mind today?</p>
                  </div>
                ) : (
                  conversation.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-900' : 'bg-white text-gray-800 border border-gray-200'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-lg bg-white text-gray-800 border border-gray-200 max-w-[80%]">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleAiSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isAiThinking}
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300 transition-colors"
                    disabled={!userMessage.trim() || isAiThinking}
                  >
                    {isAiThinking ? 'Thinking...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500&display=swap');
        
        @keyframes bounce-in {
          0% { transform: translateY(30px); opacity: 0; }
          60% { transform: translateY(-10px); opacity: 1; }
          80% { transform: translateY(5px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes card-hover {
          0% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }
        @keyframes modal-enter {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-card-hover {
          animation: card-hover 3s ease-in-out infinite;
        }
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
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

export default function MindfulnessPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        router.push('/auth?redirect=/mindfulness')
      } else {
        setUserEmail(data.session?.user?.email ?? null)
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
>>>>>>> 701f7830381713c77d9d2c4cd32db968cd2cc904
