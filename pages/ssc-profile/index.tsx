import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SSCProfile() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState<string>('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setImageUrl(URL.createObjectURL(selected))
    }
  }

  const handleUpload = async () => {
    if (!file) return alert('Please select a photo.')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error.message)
      return alert('Upload failed.')
    }

    const { data: publicUrlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)

    if (publicUrlData.publicUrl) {
      alert('Profile image uploaded successfully!')
      console.log('Public URL:', publicUrlData.publicUrl)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-600">SSC Profile Setup</h1>

      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-6">
        {/* Image Upload Preview */}
        <div className="flex flex-col items-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-40 h-40 rounded-full object-cover border-4 border-red-500"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-4"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">About You</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={4}
          />
        </div>

        <button
          onClick={handleUpload}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Upload & Continue
        </button>
      </div>
    </main>
  )
}
