<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { ROLE_ORDER } from '@/lib/roles'

export default function SSCProfile() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setEmail(data.user.email ?? '')
        setUserId(data.user.id ?? null)
        const { data: prof } = await supabase
          .from('ssc_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        if (prof) {
          setProfile(prof)
          setFullName(prof.full_name)
          setRole(prof.role)
          setDescription(prof.description)
          setImageUrl(prof.profile_url)
        }
      }
    }
    getUser()
  }, [])

  function validateFullName(name: string) {
    return /^[A-Za-z]+ [A-Za-z]+( [A-Za-z]+)*$/.test(name.trim())
  }

  const handleImageChange = (e: any) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setImageUrl(URL.createObjectURL(selected))
    }
  }

  async function uploadProfilePhoto() {
    if (!file) return imageUrl
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `uploads/${fileName}`
    const { error: uploadError } = await supabase.storage
      .from('profiles-pictures')
      .upload(filePath, file)
    if (uploadError) throw new Error(uploadError.message)
    const { data: publicUrlData } = supabase.storage
      .from('profiles-pictures')
      .getPublicUrl(filePath)
    return publicUrlData?.publicUrl || ''
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validateFullName(fullName)) return setError('Please enter your full legal name (first and last, no nicknames).')
    if (!role) return setError('Role is required.')
    if (!description) return setError('Description is required.')
    if (!file && !imageUrl) return setError('Profile photo is required.')
    if (!email || !password) return setError('Email and password required.')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !data.user) {
      setLoading(false)
      return setError(signUpError?.message || 'Sign up failed.')
    }
    setUserId(data.user.id)

    let photoUrl = imageUrl
    try {
      photoUrl = await uploadProfilePhoto()
    } catch {
      setError('Photo upload failed.')
      setLoading(false)
      return
    }

    const { error: upsertError } = await supabase.from('ssc_profiles').upsert([
      {
        user_id: data.user.id,
        email,
        full_name: fullName,
        role,
        description,
        profile_url: photoUrl,
        team: null
      }
    ])
    setLoading(false)
    if (upsertError) return setError('Saving profile failed.')
    window.location.href = '/ssc-voting'
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (loginError || !data.user) return setError(loginError?.message || 'Login failed.')
    setUserId(data.user.id)
    const { data: prof } = await supabase.from('ssc_profiles').select('*').eq('user_id', data.user.id).single()
    if (!prof) return setError('Profile not found. Please register first.')
    setProfile(prof)
    setFullName(prof.full_name)
    setRole(prof.role)
    setDescription(prof.description)
    setImageUrl(prof.profile_url)
    window.location.href = '/ssc-voting'
  }

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole)
    setShowModal(true)
  }

  const handleConfirmModal = () => setShowModal(false)
  const handleCreateTeam = () => {
    setCreatingTeam(true)
    setShowModal(true)
    setRole('President')
  }
  const handleConfirmPresident = () => {
    if (confirmText === 'PRESIDENT') {
      setRole('President')
      setShowModal(false)
    } else {
      alert('You must type PRESIDENT exactly to confirm.')
    }
  }

  if (profile) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-center text-red-600">SSC Profile</h1>
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-6">
          <div className="flex flex-col items-center">
            {imageUrl &&
              <Image
                src={imageUrl}
                alt="Profile"
                width={160}
                height={160}
                className="object-cover w-full h-full rounded-full border-4 border-red-500"
              />}
          </div>
          <div>
            <p className="font-semibold mb-1 text-black">Full Name: {profile.full_name}</p>
            <p className="mb-1 text-black">Role: {profile.role}</p>
            <p className="mb-1 text-black">About you as a {profile.role}: {profile.description}</p>
          </div>
        </div>
        <button
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
          onClick={() => window.location.href = '/ssc-voting'}
        >
          Continue to Voting
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-600">SSC Profile Setup</h1>
      <div className="mb-4 text-sm text-center text-gray-600">
        {mode === 'register' ? (
          <>Already have an account?{' '}
            <button className="underline text-blue-600" onClick={() => setMode('login')} type="button">Login</button>
          </>
        ) : (
          <>Don't have an account?{' '}
            <button className="underline text-blue-600" onClick={() => setMode('register')} type="button">Register</button>
          </>
        )}
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {mode === 'login' ? (
        <form className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block font-semibold text-black mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-black mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <form className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block font-semibold text-black mb-1">Full Name (no nicknames, first & last)</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div className="flex flex-col items-center">
            <label
              htmlFor="profileImage"
              className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-red-500 flex items-center justify-center bg-gray-200 cursor-pointer text-center"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Preview"
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-500 font-medium text-sm px-2 text-center">Click here for your PROFILE</span>
              )}
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </label>
          </div>
          <div>
            <label className="block font-semibold text-black mb-1">
              About you as a {role ? role : '[role]'}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write a short description..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-black mb-1">Select Role</label>
            <select
              value={role}
              onChange={e => handleRoleSelect(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">-- Select a Role --</option>
              {ROLE_ORDER.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div
            className="bg-gray-200 p-3 rounded-lg cursor-pointer text-center font-semibold"
            onClick={handleCreateTeam}
          >
            Create Council Team?
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-black mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
            disabled={loading}
          >
            {loading ? "Registering..." : "Upload & Continue"}
          </button>
        </form>
      )}

      {/* Confirmation Modal with X */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600" onClick={() => setShowModal(false)}>
              <span className="text-xl font-bold">&times;</span>
            </button>
            {creatingTeam ? (
              <>
                <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Leadership</h2>
                <p className="mb-4 text-black">
                  You are creating a council team. This action is irreversible and you will become the PRESIDENT.
                  Type <strong>PRESIDENT</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                />
                <button
                  onClick={handleConfirmPresident}
                  className="w-full bg-red-500 text-white py-2 rounded-lg"
                >
                  Confirm
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Role</h2>
                <p className="mb-4 text-black">
                  You have selected the role of <strong>{role}</strong>. This cannot be changed later. Are you sure?
                </p>
                <button
                  onClick={handleConfirmModal}
                  className="w-full bg-red-500 text-white py-2 rounded-lg"
                >
                  Yes, I’m Sure
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
=======
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function SSCProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (profileData) {
        router.push("/ssc-voting");
      }
      setLoading(false);
    }
    getSession();
  }, [router]);

  async function uploadPhoto(file: File) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${user?.id}/profile.${fileExt}`;
    const { error: photoError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });
    if (photoError) throw new Error(photoError.message);
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
    return data.publicUrl;
  }

  const validateFullName = (name: string) =>
    name.trim().split(" ").length >= 2 && !/[^a-zA-Z\s\-]/.test(name);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!validateFullName(fullName)) {
      setError("Please enter your full legal name (first and last, no nicknames).");
      return;
    }
    if (!profilePhoto) {
      setError("Profile photo is required.");
      return;
    }
    if (!role) {
      setError("Role is required.");
      return;
    }
    if (!about) {
      setError(`The 'About you as a ${role}' field is required.`);
      return;
    }
    setLoading(true);

    let photoUrl = "";
    try {
      photoUrl = await uploadPhoto(profilePhoto);
    } catch {
      setError("Photo upload failed.");
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      user_id: user?.id,
      full_name: fullName,
      profile_photo: photoUrl,
      role,
      about,
    });
    if (upsertError) {
      setError("Failed to save profile: " + upsertError.message);
      setLoading(false);
      return;
    }
    router.push("/ssc-voting");
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">SSC Profile Registration</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Full Name (no nicknames, first & last):</label>
        <input
          type="text"
          className="border p-2 w-full mb-4"
          value={fullName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          required
        />

        <label className="block mb-2">Profile Photo:</label>
        <input
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setProfilePhoto(e.target.files?.[0] ?? null)
          }
          required
        />

        <label className="block mb-2">Role:</label>
        <select
          className="border p-2 w-full mb-4"
          value={role}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
          required
        >
          <option value="">Select role</option>
          <option value="president">President</option>
          <option value="vice-president">Vice President</option>
          <option value="secretary">Secretary</option>
          <option value="treasurer">Treasurer</option>
        </select>

        <label className="block mb-2">
          About you as a {role || "[role]"}:
        </label>
        <textarea
          className="border p-2 w-full mb-4"
          value={about}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAbout(e.target.value)}
          required
        />

        <button
          className="bg-red-700 text-white py-2 px-4 rounded hover:bg-red-800"
          type="submit"
          disabled={loading}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
>>>>>>> 701f7830381713c77d9d2c4cd32db968cd2cc904
