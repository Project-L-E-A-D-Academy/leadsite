// pages/ssc-profile/index.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function SSCProfile() {
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [description, setDescription] = useState('')

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file)

    if (error) {
      console.error('Upload failed:', error.message)
    } else {
      const url = supabase.storage.from('profile-pictures').getPublicUrl(fileName).data.publicUrl
      setImageUrl(url)
    }

    setUploading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Create SSC Profile</h1>

        {/* Image Preview */}
        {imageUrl && (
          <div className="mb-4">
            <Image
              src={imageUrl}
              alt="Profile Preview"
              width={300}
              height={300}
              className="rounded-xl object-cover mx-auto"
            />
          </div>
        )}

        {/* Upload Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleUpload}
            className="block w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Description</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            placeholder="Tell us about yourself..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <button
          disabled={uploading}
          className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition"
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </main>
  )
}
