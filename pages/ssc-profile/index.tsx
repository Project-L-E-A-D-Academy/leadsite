import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function SSCProfile() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email)
        setUserId(user.id)
      } else {
        alert('Please log in to access this page.')
        window.location.href = '/auth'
      }
    }
    getUser()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setImageUrl(URL.createObjectURL(selected))
    }
  }

  const handleUpload = async () => {
    if (!file || !description || (!role && !creatingTeam)) {
      alert('Please complete all fields before continuing.')
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('profiles-pictures')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError.message)
      return alert('Upload failed.')
    }

    const { data: publicUrlData } = supabase.storage
      .from('profiles-pictures')
      .getPublicUrl(filePath)

    if (publicUrlData.publicUrl && userEmail && userId) {
      const { error: insertError } = await supabase.from('ssc_profiles').insert([
        {
          user_id: userId,
          email: userEmail,
          role: role || 'President',
          description,
          profile_url: publicUrlData.publicUrl,
          team: creatingTeam ? `${userEmail}'s Team` : null
        }
      ])

      if (insertError) {
        console.error('DB insert error:', insertError.message)
        return alert('Saving profile failed.')
      }

      alert('Profile image uploaded and saved successfully!')
      window.location.href = '/ssc-voting'
    }
  }

  const handleRoleSelect = (selectedRole: string) => {
    if (selectedRole === 'President') return
    setRole(selectedRole)
    setShowModal(true)
  }

  const handleConfirmModal = () => {
    setShowModal(false)
  }

  const handleCreateTeam = () => {
    setCreatingTeam(true)
    setShowModal(true)
  }

  const handleConfirmPresident = () => {
    if (confirmText === 'PRESIDENT') {
      setRole('President')
      setShowModal(false)
    } else {
      alert('You must type PRESIDENT exactly to confirm.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-600">SSC Profile Setup</h1>

      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-6">
        {/* Image Upload Preview */}
        <div className="flex flex-col items-center">
          <label htmlFor="profileImage" className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-red-500 flex items-center justify-center bg-gray-200 cursor-pointer text-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
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
            />
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            About you {role ? `to this ${role}` : ''}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={4}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Select Role</label>
          <select
            value={role}
            onChange={(e) => handleRoleSelect(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Select a Role --</option>
            <option value="Vice President">Vice President</option>
            <option value="Secretary">Secretary</option>
            <option value="Sub Secretary">Sub Secretary</option>
            <option value="Treasurer">Treasurer</option>
            <option value="Sub Treasurer">Sub Treasurer</option>
            <option value="Auditor">Auditor</option>
            <option value="PIO">PIO (Peace Officer)</option>
            <option value="Business Manager">Business Manager</option>
            <option value="Sergeant at Arms">Sergeant at Arms</option>
          </select>
        </div>

        {/* Create Team */}
        <div className="bg-gray-200 p-3 rounded-lg cursor-pointer text-center font-semibold" onClick={handleCreateTeam}>
          Create Council Team?
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Upload & Continue
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            {creatingTeam ? (
              <>
                <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Leadership</h2>
                <p className="mb-4">You are creating a council team. This action is irreversible and you will become the PRESIDENT. Type <strong>PRESIDENT</strong> to confirm.</p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
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
                <p className="mb-4">You have selected the role of <strong>{role}</strong>. This cannot be changed later. Are you sure?</p>
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
