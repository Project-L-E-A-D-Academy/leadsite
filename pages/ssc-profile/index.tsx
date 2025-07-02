import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient"; // adjust path as needed

export default function SSCProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fields
  const [fullName, setFullName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState("");

  // Check session and profile
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // redirect if not logged in
        return;
      }
      setUser(session.user);

      // Check existing profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (profile) {
        // Already registered, route to voting
        router.push("/ssc-voting");
      }
      setLoading(false);
    }
    getSession();
  }, []);

  // Handle photo upload
  async function uploadPhoto(file: File) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/profile.${fileExt}`;
    let { error } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
    return data.publicUrl;
  }

  const validateFullName = (name: string) =>
    name.trim().split(" ").length >= 2 && !/[^a-zA-Z\s\-]/.test(name);

  async function handleSubmit(e: any) {
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
      setError("The 'About you as a " + role + "' field is required.");
      return;
    }

    setLoading(true);

    let photoUrl = "";
    try {
      photoUrl = await uploadPhoto(profilePhoto);
    } catch (err) {
      setError("Photo upload failed.");
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      user_id: user.id,
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
          onChange={e => setFullName(e.target.value)}
          required
        />

        <label className="block mb-2">Profile Photo:</label>
        <input
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={e => setProfilePhoto(e.target.files?.[0] || null)}
          required
        />

        <label className="block mb-2">Role:</label>
        <select
          className="border p-2 w-full mb-4"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        >
          <option value="">Select role</option>
          <option value="president">President</option>
          <option value="vice-president">Vice President</option>
          <option value="secretary">Secretary</option>
          <option value="treasurer">Treasurer</option>
          {/* Add other roles as needed */}
        </select>

        <label className="block mb-2">
          About you as a {role || "[role]"}:
        </label>
        <textarea
          className="border p-2 w-full mb-4"
          value={about}
          onChange={e => setAbout(e.target.value)}
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
