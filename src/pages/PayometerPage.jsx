import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Share2, Trophy, Clock, BarChart2 } from 'lucide-react'
import RankingTab from '../components/ranking/RankingTab'
import HistoryTab from '../components/history/HistoryTab'
import StatsTab from '../components/stats/StatsTab'
import InviteModal from '../components/payometer/InviteModal'
import AddPointsModal from '../components/payometer/AddPointsModal'

export default function PayometerPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payometer, setPayometer] = useState(null)
  const [members, setMembers] = useState([])
  const [scores, setScores] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ranking')
  const [showInvite, setShowInvite] = useState(false)
  const [showAddPoints, setShowAddPoints] = useState(false)
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    loadData()
    const channel = supabase
      .channel(`payometer-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'score_events', filter: `payometer_id=eq.${id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships', filter: `payometer_id=eq.${id}` }, loadData)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  async function loadData() {
    const [pmRes, memRes, evtRes] = await Promise.all([
      supabase.from('payometers').select('*').eq('id', id).single(),
      supabase.from('memberships').select('*, profiles(id,username,avatar_url)').eq('payometer_id', id),
      supabase.from('score_events')
        .select('*, giver:profiles!score_events_given_by_fkey(id,username,avatar_url), receiver:profiles!score_events_received_by_fkey(id,username,avatar_url)')
        .eq('payometer_id', id)
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    if (pmRes.error || !pmRes.data) {
      // Membership may not have propagated yet (e.g. coming from JoinPage).
      // Wait 1s and retry once before giving up.
      await new Promise(r => setTimeout(r, 1000))
      const retry = await supabase.from('payometers').select('*').eq('id', id).single()
      if (retry.error || !retry.data) { navigate('/'); return }
      pmRes.data = retry.data
    }
    setPayometer(pmRes.data)

    const mems = memRes.data ?? []
    setMembers(mems)
    setIsMember(mems.some(m => m.user_id === user.id))

    const evts = evtRes.data ?? []
    setEvents(evts)

    // Calculate scores per member
    const scoreMap = {}
    mems.forEach(m => { scoreMap[m.user_id] = 0 })
    evts.forEach(e => { scoreMap[e.received_by] = (scoreMap[e.received_by] ?? 0) + e.points })

    const ranked = mems.map(m => ({
      ...m.profiles,
      role: m.role,
      score: scoreMap[m.user_id] ?? 0,
    })).sort((a, b) => b.score - a.score)

    setScores(ranked)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-6 w-32 skeleton rounded-lg" />
        <div className="h-20 skeleton rounded-2xl" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    )
  }

  if (!payometer) return null

  const tabs = [
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'history', label: 'Historial', icon: Clock },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#8E8E93] hover:text-[#F2F2F7] transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Inicio</span>
        </button>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 text-sm text-accent hover:bg-accent/10 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Share2 size={15} />
          Invitar
        </button>
      </div>

      {/* Payometer info */}
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🏆</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{payometer.name}</h1>
            {payometer.description && (
              <p className="text-[#8E8E93] text-sm mt-0.5">{payometer.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-[#6C6C70]">{members.length} miembros</span>
              <span className="text-[#3A3A3C]">·</span>
              <span className="text-xs text-[#6C6C70]">{events.length} eventos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add points button */}
      {isMember && (
        <button
          onClick={() => setShowAddPoints(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span className="text-lg">⚡</span>
          Asignar puntos de payo
        </button>
      )}

      {/* Tabs */}
      <div className="flex bg-[#1C1C1E] rounded-2xl p-1 gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? 'bg-[#2C2C2E] text-[#F2F2F7] shadow-sm'
                : 'text-[#6C6C70] hover:text-[#8E8E93]'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={tab}>
        {tab === 'ranking' && <RankingTab scores={scores} currentUserId={user.id} />}
        {tab === 'history' && <HistoryTab events={events} />}
        {tab === 'stats' && <StatsTab events={events} scores={scores} />}
      </div>

      {/* Modals */}
      {showInvite && (
        <InviteModal payometer={payometer} onClose={() => setShowInvite(false)} />
      )}
      {showAddPoints && (
        <AddPointsModal
          payometerId={id}
          members={scores.filter(m => m.id !== user.id)}
          currentUserId={user.id}
          onClose={() => setShowAddPoints(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
