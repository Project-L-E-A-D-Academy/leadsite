import { useRouter } from "next/router";
export default function GoBackButton() {
  const router = useRouter();
  return (
    <button
      className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
      onClick={() => router.push("/mindfulness")}
    >
      ← Go Back to Zone
    </button>
  );
}