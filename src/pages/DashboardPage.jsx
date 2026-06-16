import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, Users, Trophy, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [payometers, setPayometers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadPayometers()

    const channel = supabase
      .channel('dashboard-memberships')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships', filter: `user_id=eq.${user.id}` }, loadPayometers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payometers' }, loadPayometers)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function loadPayometers() {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        payometer_id,
        joined_at,
        payometers (
          id, name, description, created_at,
          memberships (count),
          score_events (points)
        )
      `)
      .eq('user_id', user.id)

    if (!error && data) {
      const mapped = data
        .filter(m => m.payometers) // safety: skip broken joins
        .map(m => {
          const pm = m.payometers
          const totalPoints = pm.score_events?.reduce((acc, e) => acc + e.points, 0) ?? 0
          return { ...pm, memberCount: pm.memberships?.[0]?.count ?? 0, totalPoints }
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setPayometers(mapped)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 skeleton rounded-lg" />
        {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {profile?.username ?? 'payo'} 👋
        </h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">Tus payómetros activos</p>
      </div>

      {/* Payometers list */}
      {payometers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {payometers.map(pm => (
            <Link
              key={pm.id}
              to={`/payometer/${pm.id}`}
              className="card block p-4 hover:bg-[#2C2C2E] transition-colors active:scale-[0.98] duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <h3 className="font-semibold truncate">{pm.name}</h3>
                  </div>
                  {pm.description && (
                    <p className="text-[#8E8E93] text-sm mt-0.5 truncate">{pm.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#6C6C70]">
                      <Users size={12} />
                      {pm.memberCount} miembro{pm.memberCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#6C6C70]">
                      <Trophy size={12} />
                      {pm.totalPoints} pts totales
                    </span>
                    <span className="text-xs text-[#6C6C70]">
                      {formatDistanceToNow(new Date(pm.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#6C6C70] shrink-0 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick create */}
      <Link to="/create" className="btn-secondary flex items-center justify-center gap-2 w-full">
        <Plus size={18} />
        Nuevo Payómetro
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card p-8 text-center animate-scale-in">
      <div className="text-5xl mb-4 animate-float inline-block">🏆</div>
      <h3 className="font-semibold text-lg mb-1">Ningún payómetro aún</h3>
      <p className="text-[#8E8E93] text-sm mb-6">
        Crea uno e invita a tus amigos, o pídele a alguien que te mande un enlace de invitación.
      </p>
      <Link to="/create" className="btn-primary inline-flex items-center gap-2">
        <Plus size={16} />
        Crear mi primer Payómetro
      </Link>
    </div>
  )
}
