import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ROLE_ORDER } from '@/lib/roles'

export default function AdminDashboard() {
  const [teams, setTeams] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: teamRows } = await supabase.from('ssc_teams').select('*')
      setTeams(teamRows || [])
      const { data: profRows } = await supabase.from('ssc_profiles').select('*')
      setProfiles(profRows || [])
      setLoading(false)
    }
    fetchData()
  }, [refresh])

  async function deleteTeam(id: number) {
    if (!confirm("Delete this team?")) return
    setActionLoading(a => ({ ...a, [`team-${id}`]: true }))
    // Get team name for member update
    const team = teams.find(t => t.id === id)
    if (team) {
      await supabase.from('ssc_profiles').update({ team: null, role: null }).eq('team', team.name)
    }
    await supabase.from('ssc_teams').delete().eq('id', id)
    setActionLoading(a => ({ ...a, [`team-${id}`]: false }))
    setRefresh(r => r + 1)
  }

  async function kickMember(user_id: string) {
    if (!confirm("Kick this member?")) return
    setActionLoading(a => ({ ...a, [`kick-${user_id}`]: true }))
    await supabase.from('ssc_profiles').update({ team: null, role: null }).eq('user_id', user_id)
    setActionLoading(a => ({ ...a, [`kick-${user_id}`]: false }))
    setRefresh(r => r + 1)
  }

  async function changeRole(user_id: string, newRole: string) {
    setActionLoading(a => ({ ...a, [`role-${user_id}`]: true }))
    await supabase.from('ssc_profiles').update({ role: newRole }).eq('user_id', user_id)
    setActionLoading(a => ({ ...a, [`role-${user_id}`]: false }))
    setRefresh(r => r + 1)
  }

  if (loading) return <div className="p-6 text-black">Loading...</div>

  return (
    <main className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-red-600 mb-6">Admin Dashboard</h1>
      <div>
        <h2 className="font-bold mb-2 text-black">Teams</h2>
        <ul>
          {teams.map(team => (
            <li key={team.id} className="mb-4 border rounded p-3 bg-white shadow">
              <div className="flex items-center mb-2">
                <span className="font-bold text-black text-lg">{team.name}</span>
                <button
                  className="ml-3 text-white bg-red-600 px-2 py-1 rounded text-sm"
                  onClick={() => deleteTeam(team.id)}
                  disabled={actionLoading[`team-${team.id}`]}
                >
                  {actionLoading[`team-${team.id}`] ? "Deleting..." : "Delete Team"}
                </button>
              </div>
              <div className="ml-2">
                <div className="font-semibold text-black">Members:</div>
                <ul>
                  {profiles
                    .filter(p => p.team === team.name)
                    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))
                    .map(member =>
                      <li key={member.user_id} className="flex items-center mb-1">
                        <span className="text-black">{member.full_name} ({member.role})</span>
                        <button
                          className="ml-2 text-white bg-yellow-600 px-2 py-1 rounded text-xs"
                          onClick={() => kickMember(member.user_id)}
                          disabled={actionLoading[`kick-${member.user_id}`]}
                        >
                          {actionLoading[`kick-${member.user_id}`] ? "Kicking..." : "Kick"}
                        </button>
                        <select
                          className="ml-2 border rounded px-2 py-1 text-xs"
                          value={member.role}
                          onChange={e => changeRole(member.user_id, e.target.value)}
                          disabled={actionLoading[`role-${member.user_id}`]}
                        >
                          {ROLE_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </li>
                    )}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}