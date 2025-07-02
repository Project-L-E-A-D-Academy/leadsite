import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";

export default function SSCVoting() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [teamName, setTeamName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [voteState, setVoteState] = useState<{ [key: string]: boolean }>({});
  const [modal, setModal] = useState<{ show: boolean; memberId: string; role: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Get profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      setProfile(prof);

      // Check if user is president and already made a team
      const { data: myTeams } = await supabase
        .from("team_councils")
        .select("*")
        .eq("president_id", session.user.id)
        .maybeSingle();
      setMyTeam(myTeams);

      // Get all teams and their members
      const { data: allTeams, error } = await supabase
        .from("team_councils")
        .select("*, members:team_members(*, profile:profiles(*)), votes:votes(*)");

      setTeams(allTeams || []);
    }
    getData();
  }, []);

  // Team creation (President)
  async function handleCreateTeam(e: any) {
    e.preventDefault();
    setError("");
    if (!teamName.trim()) {
      setError("Team Council Name is required.");
      return;
    }
    setCreatingTeam(true);
    const { error } = await supabase.from("team_councils").insert({
      name: teamName,
      slogan: slogan.trim() || null,
      president_id: user.id,
    });
    if (error) setError(error.message);
    setCreatingTeam(false);
    router.reload();
  }

  // Voting logic
  async function handleVote(memberId: string, role: string) {
    // Prevent double voting for same role
    const { data: alreadyVoted } = await supabase
      .from("votes")
      .select("*")
      .eq("voter_id", user.id)
      .eq("role", role)
      .single();
    if (alreadyVoted) {
      setError("You have already voted for this role.");
      setVoteState((s) => ({ ...s, [memberId + role]: true }));
      return;
    }
    // Modal confirmation
    setModal({ show: true, memberId, role });
  }

  async function confirmVote(memberId: string, role: string) {
    // Double-check in backend (atomic)
    const { data: alreadyVoted } = await supabase
      .from("votes")
      .select("*")
      .eq("voter_id", user.id)
      .eq("role", role)
      .single();
    if (alreadyVoted) {
      setError("You have already voted for this role.");
      setVoteState((s) => ({ ...s, [memberId + role]: true }));
      setModal(null);
      return;
    }

    await supabase.from("votes").insert({
      team_member_id: memberId,
      role,
      voter_id: user.id,
    });
    setVoteState((s) => ({ ...s, [memberId + role]: true }));
    setModal(null);
    router.reload();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">SSC Voting</h1>
        </div>
        <div className="flex items-center gap-2">
          {profile && (
            <>
              <img
                src={profile.profile_photo}
                alt="Profile"
                className="rounded-full border-4 border-red-700 w-12 h-12 object-cover"
              />
              <span className="font-semibold">{profile.full_name}</span>
            </>
          )}
        </div>
      </div>

      {profile?.role === "president" && !myTeam && (
        <form onSubmit={handleCreateTeam} className="mb-8">
          <h2 className="font-bold">Create Team Council</h2>
          <input
            type="text"
            placeholder="Team Council Name"
            className="border p-2 mb-2 w-full"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Slogan (optional)"
            className="border p-2 mb-2 w-full"
            value={slogan}
            onChange={e => setSlogan(e.target.value)}
          />
          <button
            className="bg-red-700 text-white py-2 px-4 rounded hover:bg-red-800"
            type="submit"
            disabled={creatingTeam}
          >
            Make?
          </button>
        </form>
      )}

      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Team Council Cards */}
      <div className="space-y-6">
        {teams.map((team) => (
          <TeamCouncilCard
            key={team.id}
            team={team}
            userId={user?.id}
            voteState={voteState}
            onVote={handleVote}
          />
        ))}
      </div>

      {/* Modal */}
      {modal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded max-w-md text-center">
            <h2 className="text-lg font-bold mb-4">Confirm your vote?</h2>
            <button
              className="bg-red-700 text-white px-4 py-2 rounded mr-2"
              onClick={() => confirmVote(modal.memberId, modal.role)}
            >
              Yes, Vote!
            </button>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamCouncilCard({ team, userId, voteState, onVote }: any) {
  const [expanded, setExpanded] = useState(false);
  const totalVotes = team.votes?.length || 0;

  return (
    <div className="border rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xl font-bold">{team.name}</div>
          <div className="text-sm text-gray-500 mb-2">by {team.president_id}</div>
        </div>
        <div className="text-2xl font-bold">{totalVotes} votes</div>
      </div>
      <div className="mb-2">
        <span className="italic">
          Slogan: {team.slogan || <span className="text-gray-400">N/A</span>}
        </span>
      </div>
      <button
        className="text-blue-600 underline"
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? "Hide Members" : "Show Members"}
      </button>
      {expanded && (
        <div className="mt-4 space-y-2">
          {team.members.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center border-b py-2 last:border-b-0"
            >
              <span className="font-bold mr-2">{member.profile.full_name}</span>
              <img
                src={member.profile.profile_photo}
                className="rounded-full w-8 h-8 border-2 border-red-700 mx-2"
                alt={member.profile.full_name}
              />
              <span className="text-sm mr-2">{member.role}</span>
              <span className="mr-2">({(team.votes || []).filter((v: any) => v.team_member_id === member.id).length} votes)</span>
              <button
                className={`ml-auto py-1 px-3 rounded ${
                  voteState[member.id + member.role]
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-red-700 text-white hover:bg-red-800"
                }`}
                disabled={voteState[member.id + member.role]}
                onClick={() => onVote(member.id, member.role)}
              >
                {voteState[member.id + member.role] ? "Voted" : "Vote"}
              </button>
              {/* Arrow & Description */}
              {member.profile.about && (
                <div className="ml-2">
                  <details>
                    <summary className="cursor-pointer">About</summary>
                    <div className="text-sm">{member.profile.about}</div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
