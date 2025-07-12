<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { ROLE_ORDER } from '@/lib/roles'

export default function SSCVoting() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<{ [teamId: number]: any[] }>({})
  const [votes, setVotes] = useState<any[]>([])
  const [myTeam, setMyTeam] = useState<any>(null)
  const [expandTeams, setExpandTeams] = useState<{ [id: number]: boolean }>({})
  const [votedRoles, setVotedRoles] = useState<{ [role: string]: number }>(() => ({}))
  const [joinModal, setJoinModal] = useState<{ show: boolean, team: any } | null>(null)
  const [joinRole, setJoinRole] = useState('')
  const [modal, setModal] = useState<{ show: boolean, teamId: number, memberId: string, role: string } | null>(null)
  const [adminModal, setAdminModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminAccess, setAdminAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getEverything = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth?redirect=/ssc-voting')
        return
      }
      const { data: prof } = await supabase.from('ssc_profiles').select('*').eq('user_id', user.id).single()
      if (!prof) return
      setProfile(prof)

      const { data: teamRows } = await supabase.from('ssc_teams').select('*, president_profile:ssc_profiles(*)')
      setTeams(teamRows || [])

      let memberMap: { [teamId: number]: any[] } = {}
      if (teamRows) {
        for (const team of teamRows) {
          const { data: members } = await supabase.from('ssc_profiles').select('*').eq('team', team.name)
          // include president always even if not in team-members (prevent duplicates)
          const allMembers = [...(members || []), team.president_profile]
            .filter((v, i, arr) => arr.findIndex(x => x.user_id === v.user_id) === i)
          memberMap[team.id] = allMembers
        }
      }
      setTeamMembers(memberMap)
      const { data: voteRows } = await supabase.from('ssc_votes').select('*')
      setVotes(voteRows || [])

      if (prof.team) {
        const mine = teamRows?.find((t: any) => t.name === prof.team)
        setMyTeam(mine || null)
      }
      const { data: myVotes } = await supabase.from('ssc_votes').select('*').eq('voter_id', user.id)
      setVotedRoles((myVotes || []).reduce((acc: any, v: any) => ({ ...acc, [v.role]: v.team_id }), {}))
      setLoading(false)
    }
    getEverything()
  }, [router])

  // ADMIN
  const openAdminModal = () => setAdminModal(true)
  const closeAdminModal = () => { setAdminModal(false); setAdminPassword('') }
  const handleAdminLogin = () => {
    if (adminPassword === "ONLYLEADTEACHERS") setAdminAccess(true)
    else alert("Wrong password!")
  }

  // TEAM JOIN
  const openJoinModal = (team: any) => { setJoinModal({ show: true, team }); setJoinRole('') }
  const closeJoinModal = () => setJoinModal(null)
  const handleJoin = async () => {
    if (!joinRole) return alert('Select a role')
    await supabase.from('ssc_profiles').update({ team: joinModal?.team.name, role: joinRole }).eq('user_id', profile.user_id)
    setJoinModal(null)
    window.location.reload()
  }

  // VOTING
  function handleVote(teamId: number, memberId: string, role: string) {
    if (votedRoles[role]) {
      alert('You have already voted for this role in another team.')
      return
    }
    setModal({ show: true, teamId, memberId, role })
  }
  async function confirmVote(teamId: number, memberId: string, role: string) {
    await supabase.from('ssc_votes').insert([{
      voter_id: profile?.user_id,
      team_id: teamId,
      team_member_id: memberId,
      role
    }])
    setVotedRoles({ ...votedRoles, [role]: teamId })
    setModal(null)
    window.location.reload()
  }

  // TEAM DELETE
  async function handleDeleteTeam(teamId: number) {
    if (!window.confirm("Are you sure you want to disband your council team?")) return
    await supabase.from('ssc_teams').delete().eq('id', teamId)
    await supabase.from('ssc_profiles').update({ team: null, role: null }).eq('user_id', profile.user_id)
    window.location.reload()
  }

  if (loading || !profile) return <p className="text-center mt-20 text-black">Loading profile...</p>

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-red-600">SSC Voting</h1>
          <p className="text-black">Welcome, {profile.full_name}</p>
          <p className="text-sm text-black">
            Role: {profile.role} | Team: {profile.team || 'None'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {profile.profile_url && (
            <div className="relative">
              <Image
                src={profile.profile_url}
                alt="Profile"
                width={56}
                height={56}
                className="rounded-full object-cover border-4 border-red-700"
              />
              {/* Lock emoji for admin */}
              <button
                className="absolute bottom-0 right-0 text-2xl"
                title="Admin"
                onClick={openAdminModal}
                style={{ background: 'white', borderRadius: '50%', border: '1px solid #ccc', width: '32px', height: '32px' }}
              >🔒</button>
            </div>
=======
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface Profile {
  user_id: string;
  full_name: string;
  profile_photo: string;
  role: string;
  about: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profile: Profile;
}

interface Vote {
  id: string;
  team_member_id: string;
  role: string;
  voter_id: string;
}

interface TeamCouncil {
  id: string;
  name: string;
  slogan: string | null;
  president_id: string;
  members: TeamMember[];
  votes: Vote[];
}

export default function SSCVoting() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teams, setTeams] = useState<TeamCouncil[]>([]);
  const [myTeam, setMyTeam] = useState<TeamCouncil | null>(null);
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

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (prof) setProfile(prof as Profile);

      const { data: myTeamData } = await supabase
        .from("team_councils")
        .select("*, members:team_members(*, profile:profiles(*)), votes:votes(*)")
        .eq("president_id", session.user.id)
        .maybeSingle();
      if (myTeamData) setMyTeam(myTeamData as TeamCouncil);

      const { data: allTeams } = await supabase
        .from("team_councils")
        .select("*, members:team_members(*, profile:profiles(*)), votes:votes(*)");
      if (allTeams) setTeams(allTeams as TeamCouncil[]);
    }
    getData();
  }, [router]);

  async function handleCreateTeam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!teamName.trim()) {
      setError("Team Council Name is required.");
      return;
    }
    setCreatingTeam(true);
    const { error: teamError } = await supabase.from("team_councils").insert({
      name: teamName,
      slogan: slogan.trim() || null,
      president_id: user?.id,
    });
    if (teamError) {
      setError(teamError.message);
      setCreatingTeam(false);
      return;
    }
    setCreatingTeam(false);
    router.reload();
  }

  async function handleVote(memberId: string, role: string) {
    const { data: alreadyVoted } = await supabase
      .from("votes")
      .select("*")
      .eq("voter_id", user?.id)
      .eq("role", role)
      .single();
    if (alreadyVoted) {
      setError("You have already voted for this role.");
      setVoteState((s) => ({ ...s, [memberId + role]: true }));
      return;
    }
    setModal({ show: true, memberId, role });
  }

  async function confirmVote(memberId: string, role: string) {
    const { data: alreadyVoted } = await supabase
      .from("votes")
      .select("*")
      .eq("voter_id", user?.id)
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
      voter_id: user?.id,
    });
    setVoteState((s) => ({ ...s, [memberId + role]: true }));
    setModal(null);
    router.reload();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">SSC Voting</h1>
        </div>
        <div className="flex items-center gap-2">
          {profile && (
            <>
              <Image
                src={profile.profile_photo}
                alt="Profile"
                className="rounded-full border-4 border-red-700 object-cover"
                width={48}
                height={48}
              />
              <span className="font-semibold">{profile.full_name}</span>
            </>
>>>>>>> 701f7830381713c77d9d2c4cd32db968cd2cc904
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* ADMIN MODAL */}
      {adminModal && !adminAccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600" onClick={closeAdminModal}>
              <span className="text-xl font-bold">&times;</span>
            </button>
            <h2 className="text-xl font-bold text-red-600 mb-4">Admin Access</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full border p-2 mb-4"
            />
            <button
              className="w-full bg-red-500 text-white py-2 rounded-lg"
              onClick={handleAdminLogin}
            >Enter</button>
          </div>
        </div>
      )}
      {adminAccess && (
        <iframe src="/admin-dashboard" title="Admin Dashboard" className="fixed inset-0 w-full h-full bg-white z-50" />
      )}

      <div className="space-y-6">
        {teams.map(team => {
          // show "Join?" if not on any team and not president of this team
          const canJoin = !profile.team && team.president_id !== profile.user_id
          // roles already taken in this team
          const takenRoles = (teamMembers[team.id] || []).map(m => m.role)
          // what roles are open to join
          const openRoles = ROLE_ORDER.filter(r => !takenRoles.includes(r) && r !== "President")
          return (
            <div key={team.id} className="border rounded-lg shadow p-4 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold text-black">{team.name}</div>
                  <div className="text-xs text-gray-500 mb-1">by {team.president_profile.full_name}</div>
                </div>
                <div className="text-2xl font-bold">
                  {(votes.filter(v => v.team_id === team.id)).length} votes
                </div>
                {profile?.user_id === team.president_id && (
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded ml-2"
                    onClick={() => handleDeleteTeam(team.id)}
                  >Delete Team</button>
                )}
                {profile.team === team.name ? (
                  <button
                    className="ml-2 bg-gray-400 text-white px-2 py-1 rounded cursor-not-allowed"
                    disabled
                  >Joined</button>
                ) : profile.team ? (
                  <button
                    className="ml-2 bg-gray-300 text-gray-500 px-2 py-1 rounded cursor-not-allowed"
                    disabled
                  >Join?</button>
                ) : (
                  <button
                    className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
                    onClick={() => openJoinModal(team)}
                  >Join?</button>
                )}
              </div>
              <div className="mb-2">
                <span className="italic text-black">
                  Slogan: {team.slogan ? team.slogan : <span className="text-gray-400">N/A</span>}
                </span>
              </div>
              <button
                className="text-blue-600 underline"
                onClick={() => setExpandTeams(et => ({ ...et, [team.id]: !et[team.id] }))}
              >
                {expandTeams[team.id] ? "Hide Members" : "Show Members"}
              </button>
              {expandTeams[team.id] && (
                <div className="mt-4 space-y-2">
                  {(teamMembers[team.id] || [])
                    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))
                    .map(member => (
                      <div
                        key={member.user_id}
                        className={`flex items-center border-b py-2 last:border-b-0 ${member.user_id === profile.user_id ? 'bg-yellow-100' : ''}`}
                      >
                        <span className="font-bold mr-2 text-black">{member.full_name}</span>
                        <Image
                          src={member.profile_url}
                          className="rounded-full w-8 h-8 border-2 border-red-700 mx-2"
                          alt={member.full_name}
                          width={32}
                          height={32}
                        />
                        <span className="text-sm mr-2 text-black">{member.role}</span>
                        <span className="mr-2 text-black">
                          (
                          {votes.filter(v => v.team_member_id === member.user_id).length} votes
                          )
                        </span>
                        <button
                          className={`ml-auto py-1 px-3 rounded ${votedRoles[member.role]
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-red-700 text-white hover:bg-red-800"
                            }`}
                          disabled={votedRoles[member.role] !== undefined || member.user_id === profile.user_id}
                          onClick={() => handleVote(team.id, member.user_id, member.role)}
                        >
                          {votedRoles[member.role] ? "Voted" : "Vote"}
                        </button>
                        <details className="ml-2">
                          <summary className="cursor-pointer text-black">About</summary>
                          <div className="text-sm text-black">{member.description}</div>
                        </details>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* JOIN MODAL */}
      {joinModal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600" onClick={closeJoinModal}>
              <span className="text-xl font-bold">&times;</span>
            </button>
            <h2 className="text-xl font-bold text-red-600 mb-4">Join Council</h2>
            <div className="mb-2 text-black">Select your role:</div>
            <select
              value={joinRole}
              onChange={e => setJoinRole(e.target.value)}
              className="w-full border p-2 mb-4"
            >
              <option value="">-- Select Role --</option>
              {(ROLE_ORDER.filter(r => r !== "President" && !(teamMembers[joinModal.team.id] || []).some(m => m.role === r))).map(r =>
                <option key={r} value={r}>{r}</option>
              )}
            </select>
            <button
              className="w-full bg-red-500 text-white py-2 rounded-lg"
              onClick={handleJoin}
            >Join as {joinRole || "..."}</button>
          </div>
        </div>
      )}

      {/* VOTE MODAL */}
      {modal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded max-w-md text-center relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600" onClick={() => setModal(null)}>
              <span className="text-xl font-bold">&times;</span>
            </button>
            <h2 className="text-lg font-bold mb-4 text-black">Confirm your vote?</h2>
            <button
              className="bg-red-700 text-white px-4 py-2 rounded mr-2"
              onClick={() => confirmVote(modal.teamId, modal.memberId, modal.role)}
=======
      {profile?.role === "president" && !myTeam && (
        <form onSubmit={handleCreateTeam} className="mb-8">
          <h2 className="font-bold">Create Team Council</h2>
          <input
            type="text"
            placeholder="Team Council Name"
            className="border p-2 mb-2 w-full"
            value={teamName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Slogan (optional)"
            className="border p-2 mb-2 w-full"
            value={slogan}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSlogan(e.target.value)}
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

      <div className="space-y-6">
        {teams.map((team) => (
          <TeamCouncilCard
            key={team.id}
            team={team}
            voteState={voteState}
            onVote={handleVote}
          />
        ))}
      </div>

      {modal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded max-w-md text-center">
            <h2 className="text-lg font-bold mb-4">Confirm your vote?</h2>
            <button
              className="bg-red-700 text-white px-4 py-2 rounded mr-2"
              onClick={() => confirmVote(modal.memberId, modal.role)}
>>>>>>> 701f7830381713c77d9d2c4cd32db968cd2cc904
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
<<<<<<< HEAD
    </main>
  )
}
=======
    </div>
  );
}

function TeamCouncilCard({
  team,
  voteState,
  onVote,
}: {
  team: TeamCouncil;
  voteState: { [key: string]: boolean };
  onVote: (memberId: string, role: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalVotes = team.votes ? team.votes.length : 0;

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
          Slogan: {team.slogan ? team.slogan : <span className="text-gray-400">N/A</span>}
        </span>
      </div>
      <button
        className="text-blue-600 underline"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? "Hide Members" : "Show Members"}
      </button>
      {expanded && (
        <div className="mt-4 space-y-2">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center border-b py-2 last:border-b-0"
            >
              <span className="font-bold mr-2">{member.profile.full_name}</span>
              <Image
                src={member.profile.profile_photo}
                className="rounded-full w-8 h-8 border-2 border-red-700 mx-2"
                alt={member.profile.full_name}
                width={32}
                height={32}
              />
              <span className="text-sm mr-2">{member.role}</span>
              <span className="mr-2">
                (
                {(team.votes || []).filter((v) => v.team_member_id === member.id).length} votes)
              </span>
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
>>>>>>> 701f7830381713c77d9d2c4cd32db968cd2cc904
