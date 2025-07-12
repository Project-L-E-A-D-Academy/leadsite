// pages/nutrition.tsx
<<<<<<< HEAD
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Add this import
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';
import AuthWrapper from '../components/AuthWrapper';

// ... rest of the code remains exactly the same ...

export default function NutritionPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [dietaryPreference, setDietaryPreference] = useState('balanced');
  const [activeTab, setActiveTab] = useState('chat');
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [groceryList, setGroceryList] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadChatHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        
        // Load chat history
        const { data: chatData } = await supabase
          .from('nutrition_chats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (chatData && chatData.length > 0) {
          const loadedMessages = chatData.map(msg => ({
            from: msg.sender as 'user' | 'bot',
            text: msg.message
          }));
          setMessages(loadedMessages);
        } else {
          // Initial greeting if no history
          setMessages([{
            from: 'bot',
            text: `Hello! I'm NutriPal, your AI nutrition coach. How can I help you with your ${dietaryPreference} diet today?`
          }]);
        }

        // Load grocery list
        const { data: groceryData } = await supabase
          .from('nutrition_grocery_lists')
          .select('item')
          .eq('user_id', user.id);
        
        if (groceryData) {
          setGroceryList(groceryData.map(item => item.item));
        }
      }
    };

    loadChatHistory();
  }, [dietaryPreference]);

  const saveMessage = async (message: string, sender: 'user' | 'bot') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('nutrition_chats').insert([{
        user_id: user.id,
        message,
        sender
      }]);
    }
  };

  const saveGroceryList = async (items: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Clear existing items
      await supabase.from('nutrition_grocery_lists')
        .delete()
        .eq('user_id', user.id);
      
      // Insert new items
      if (items.length > 0) {
        await supabase.from('nutrition_grocery_lists').insert(
          items.map(item => ({
            user_id: user.id,
            item
          }))
        );
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const sendMessage = async () => {
    if (!prompt.trim()) return;
    
    const userMessage = { from: 'user' as const, text: prompt };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(prompt, 'user');
    setLoading(true);
    setPrompt('');

    try {
      const res = await fetch('/api/foodcoach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          dietaryPreference 
        }),
      });
      
      const data = await res.json();
      if (data.reply) {
        const botMessage = { from: 'bot', text: data.reply };
        setMessages(prev => [...prev, botMessage]);
        await saveMessage(data.reply, 'bot');
        
        // Auto-detect if the bot generated a meal plan
        if (data.reply.includes('Breakfast:') || data.reply.includes('Lunch:')) {
          setMealPlan(data.reply);
        }
        
        // Auto-detect grocery list
        if (data.reply.includes('Grocery List:')) {
          const listMatch = data.reply.match(/Grocery List:([\s\S]*?)(?=Nutrition|$)/i);
          if (listMatch) {
            const items = listMatch[1].split('\n')
              .map(item => item.trim())
              .filter(item => item.length > 0 && !item.includes(':'));
            setGroceryList(items);
            await saveGroceryList(items);
          }
        }
      }
    } catch (err) {
      const errorMessage = '❌ Sorry, I encountered an error. Please try again later.';
      setMessages(prev => [...prev, { from: 'bot', text: errorMessage }]);
      await saveMessage(errorMessage, 'bot');
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a ${dietaryPreference} meal plan for one day with breakfast, lunch, dinner, and snacks. Include nutritional information and a grocery list.`;
      setPrompt(prompt);
      await sendMessage();
    } finally {
      setLoading(false);
    }
  };

  const addToGroceryList = async (item: string) => {
    if (!groceryList.includes(item)) {
      const newList = [...groceryList, item];
      setGroceryList(newList);
      await saveGroceryList(newList);
    }
  };

  const removeFromGroceryList = async (index: number) => {
    const newList = groceryList.filter((_, i) => i !== index);
    setGroceryList(newList);
    await saveGroceryList(newList);
  };

  return (
    <AuthWrapper>
      <Head>
        <title>NutriPal - Personalized Nutrition</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      
      <main className="min-h-screen p-4 md:p-8 text-gray-800" style={{
        backgroundColor: '#ffffff',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 2000 1500\'%3E%3Cdefs%3E%3Crect stroke=\'%23ffffff\' stroke-width=\'0.4\' width=\'1\' height=\'1\' id=\'s\'/%3E%3Cpattern id=\'a\' width=\'3\' height=\'3\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cuse fill=\'%23fcfcfc\' href=\'%23s\' y=\'2\'/%3E%3Cuse fill=\'%23fcfcfc\' href=\'%23s\' x=\'1\' y=\'2\'/%3E%3Cuse fill=\'%23fafafa\' href=\'%23s\' x=\'2\' y=\'2\'/%3E%3Cuse fill=\'%23fafafa\' href=\'%23s\'/%3E%3Cuse fill=\'%23f7f7f7\' href=\'%23s\' x=\'2\'/%3E%3Cuse fill=\'%23f7f7f7\' href=\'%23s\' x=\'1\' y=\'1\'/%3E%3C/pattern%3E%3Cpattern id=\'b\' width=\'7\' height=\'11\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cg fill=\'%23f5f5f5\'%3E%3Cuse href=\'%23s\'/%3E%3Cuse href=\'%23s\' y=\'5\' /%3E%3Cuse href=\'%23s\' x=\'1\' y=\'10\'/%3E%3Cuse href=\'%23s\' x=\'2\' y=\'1\'/%3E%3Cuse href=\'%23s\' x=\'2\' y=\'4\'/%3E%3Cuse href=\'%23s\' x=\'3\' y=\'8\'/%3E%3Cuse href=\'%23s\' x=\'4\' y=\'3\'/%3E%3Cuse href=\'%23s\' x=\'4\' y=\'7\'/%3E%3Cuse href=\'%23s\' x=\'5\' y=\'2\'/%3E%3Cuse href=\'%23s\' x=\'5\' y=\'6\'/%3E%3Cuse href=\'%23s\' x=\'6\' y=\'9\'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id=\'h\' width=\'5\' height=\'13\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cg fill=\'%23f5f5f5\'%3E%3Cuse href=\'%23s\' y=\'5\'/%3E%3Cuse href=\'%23s\' y=\'8\'/%3E%3Cuse href=\'%23s\' x=\'1\' y=\'1\'/%3E%3Cuse href=\'%23s\' x=\'1\' y=\'9\'/%3E%3Cuse href=\'%23s\' x=\'1\' y=\'12\'/%3E%3Cuse href=\'%23s\' x=\'2\'/%3E%3Cuse href=\'%23s\' x=\'2\' y=\'4\'/%3E%3Cuse href=\'%23s\' x=\'3\' y=\'2\'/%3E%3Cuse href=\'%23s\' x=\'3\' y=\'6\'/%3E%3Cuse href=\'%23s\' x=\'3\' y=\'11\'/%3E%3Cuse href=\'%23s\' x=\'4\' y=\'3\'/%3E%3Cuse href=\'%23s\' x=\'4\' y=\'7\'/%3E%3Cuse href=\'%23s\' x=\'4\' y=\'10\'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id=\'c\' width=\'17\' height=\'13\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cg fill=\'%23f2f2f2\'%3E%3Cuse href=\'%23s\' y=\'11\'/%3E%3Cuse href=\'%23s\' x=\'2\' y=\'9\'/%3E%3Cuse href=\'%23s\' x=\'5\' y=\'12\'/%3E%3Cuse href=\'%23s\' x=\'9\' y=\'4\'/%3E%3Cuse href=\'%23s\' x=\'12\' y=\'1\'/%3E%3Cuse href=\'%23s\' x=\'16\' y=\'6\'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id=\'d\' width=\'19\' height=\'17\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cg fill=\'%23ffffff\'%3E%3Cuse href=\'%23s\' y=\'9\'/%3E%3Cuse href=\'%23s\' x=\'16\' y=\'5\'/%3E%3Cuse href=\'%23s\' x=\'14\' y=\'2\'/%3E%3Cuse href=\'%23s\' x=\'11\' y=\'11\'/%3E%3Cuse href=\'%23s\' x=\'6\' y=\'14\'/%3E%3C/g%3E%3Cg fill=\'%23efefef\'%3E%3Cuse href=\'%23s\' x=\'3\' y=\'13\'/%3E%3Cuse href=\'%23s\' x=\'9\' y=\'7\'/%3E%3Cuse href=\'%23s\' x=\'13\' y=\'10\'/%3E%3Cuse href=\'%23s\' x=\'15\' y=\'4\'/%3E%3Cuse href=\'%23s\' x=\'18\' y=\'1\'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id=\'e\' width=\'47\' height=\'53\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cg fill=\'%232EA82A\'%3E%3Cuse href=\'%23s\' x=\'2\' y=\'5\'/%3E%3Cuse href=\'%23s\' x=\'16\' y=\'38\'/%3E%3Cuse href=\'%23s\' x=\'46\' y=\'42\'/%3E%3Cuse href=\'%23s\' x=\'29\' y=\'20\'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id=\'f\' width=\'59\' height=\'71\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cg fill=\'%232EA82A\'%3E%3Cuse href=\'%23s\' x=\'33\' y=\'13\'/%3E%3Cuse href=\'%23s\' x=\'27\' y=\'54\'/%3E%3Cuse href=\'%23s\' x=\'55\' y=\'55\'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id=\'g\' width=\'139\' height=\'97\' patternUnits=\'userSpaceOnUse\' patternTransform=\'rotate(27 1000 750) scale(50) translate(-980 -735)\'%3E%3Cg fill=\'%232EA82A\'%3E%3Cuse href=\'%23s\' x=\'11\' y=\'8\'/%3E%3Cuse href=\'%23s\' x=\'51\' y=\'13\'/%3E%3Cuse href=\'%23s\' x=\'17\' y=\'73\'/%3E%3Cuse href=\'%23s\' x=\'99\' y=\'57\'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect fill=\'url(%23a)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect fill=\'url(%23b)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect fill=\'url(%23h)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect fill=\'url(%23c)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect fill=\'url(%23d)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect fill=\'url(%23e)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect fill=\'url(%23f)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect fill=\'url(%23g)\' width=\'100%25\' height=\'100%25\'/%3E%3C/svg%3E")',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}>
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-full animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-playfair text-green-800">
                Nutri<span className="text-green-600">Pal</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300">
                ← Menu
              </Link>
              <span className="text-sm md:text-base font-medium bg-green-100 px-3 py-1 rounded-full">
                👋 {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - Dietary preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Dietary Preferences
              </h2>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="balanced">Balanced</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="dairy-free">Dairy-Free</option>
                <option value="low-carb">Low-Carb</option>
                <option value="mediterranean">Mediterranean</option>
              </select>

              <button
                onClick={generateMealPlan}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                )}
                Generate Meal Plan
              </button>

              {/* Grocery List */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-green-700">🛒 Grocery List</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {groceryList.length > 0 ? (
                    groceryList.map((item, index) => (
                      <li key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="flex-1">{item}</span>
                        <button 
                          onClick={() => removeFromGroceryList(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Your grocery list is empty</p>
                  )}
                </ul>
              </div>
            </div>

            {/* Main content - Chat interface */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b">
                <button
                  className={`flex-1 py-3 font-medium ${activeTab === 'chat' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('chat')}
                >
                  💬 Chat with NutriPal
                </button>
                <button
                  className={`flex-1 py-3 font-medium ${activeTab === 'mealplan' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('mealplan')}
                  disabled={!mealPlan}
                >
                  🍽️ Your Meal Plan
                </button>
              </div>

              {activeTab === 'chat' ? (
                <div className="p-4 h-[500px] flex flex-col">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${msg.from === 'user'
                            ? 'bg-green-100 text-green-900'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          <div className="font-medium mb-1">
                            {msg.from === 'user' ? 'You' : 'NutriPal'}
                          </div>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask about meals, recipes, nutrition..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !prompt.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 transition-all duration-300"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 h-[500px] overflow-y-auto">
                  {mealPlan ? (
                    <div className="whitespace-pre-wrap bg-green-50 p-4 rounded-lg">
                      {mealPlan.split('\n').map((line: string, i: number) => (
                        <p key={i} className={line.includes(':') ? 'font-semibold text-green-700' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Generate a meal plan first using the chat</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        body {
          font-family: 'Poppins', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </AuthWrapper>
  );
}
=======
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
>>>>>>> 701f7830381713c77d9d2c4cd32db968cd2cc904
