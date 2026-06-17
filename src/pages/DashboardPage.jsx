import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, Users, Trophy, ChevronRight, MoreVertical, LogOut, Trash2, X, Share2 } from 'lucide-react'
import InviteModal from '../components/payometer/InviteModal'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [payometers, setPayometers] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(null) // payometer id
  const [invitePayometer, setInvitePayometer] = useState(null) // payometer object
  const [confirm, setConfirm] = useState(null) // { id, name, action: 'leave'|'delete' }
  const [actionLoading, setActionLoading] = useState(false)

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
        payometer_id, role, joined_at,
        payometers (
          id, name, description, created_at, created_by,
          memberships (count),
          score_events (points)
        )
      `)
      .eq('user_id', user.id)

    if (!error && data) {
      const mapped = data
        .filter(m => m.payometers)
        .map(m => {
          const pm = m.payometers
          const totalPoints = pm.score_events?.reduce((acc, e) => acc + e.points, 0) ?? 0
          return { ...pm, memberCount: pm.memberships?.[0]?.count ?? 0, totalPoints, myRole: m.role }
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setPayometers(mapped)
    }
    setLoading(false)
  }

  async function handleLeave(id) {
    setActionLoading(true)
    await supabase.from('memberships').delete().eq('payometer_id', id).eq('user_id', user.id)
    setConfirm(null)
    setActionLoading(false)
    loadPayometers()
  }

  async function handleDelete(id) {
    setActionLoading(true)
    // Deleting the payometer cascades memberships and score_events via FK
    await supabase.from('payometers').delete().eq('id', id)
    setConfirm(null)
    setActionLoading(false)
    loadPayometers()
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
    <div className="space-y-6 animate-fade-in" onClick={() => setMenuOpen(null)}>
      <div>
        <h1 className="text-2xl font-bold">Hola, {profile?.username ?? 'payo'} 👋</h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">Tus payómetros activos</p>
      </div>

      {payometers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {payometers.map(pm => {
            const isAdmin = pm.myRole === 'admin'
            return (
              <div key={pm.id} className="relative">
                <Link
                  to={`/payometer/${pm.id}`}
                  className="card block p-4 hover:bg-[#2C2C2E] transition-colors active:scale-[0.98] duration-150 pr-12"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <h3 className="font-semibold truncate">{pm.name}</h3>
                        {isAdmin && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-medium shrink-0">admin</span>}
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

                {/* Menu button */}
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setMenuOpen(menuOpen === pm.id ? null : pm.id) }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#6C6C70] hover:text-[#F2F2F7] transition-colors z-10"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown */}
                {menuOpen === pm.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="absolute top-10 right-3 z-20 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                  >
                    <button
                      onClick={() => { setInvitePayometer(pm); setMenuOpen(null) }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-[#3A3A3C] transition-colors text-[#F2F2F7]"
                    >
                      <Share2 size={15} className="text-[#8E8E93]" />
                      Invitar amigos
                    </button>
                    <div className="h-px bg-white/5" />
                    {!isAdmin && (
                      <button
                        onClick={() => { setConfirm({ id: pm.id, name: pm.name, action: 'leave' }); setMenuOpen(null) }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-[#3A3A3C] transition-colors text-[#F2F2F7]"
                      >
                        <LogOut size={15} className="text-[#8E8E93]" />
                        Salirse del grupo
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => { setConfirm({ id: pm.id, name: pm.name, action: 'delete' }); setMenuOpen(null) }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-[#3A3A3C] transition-colors text-red-400"
                      >
                        <Trash2 size={15} />
                        Eliminar grupo
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Link to="/create" className="btn-secondary flex items-center justify-center gap-2 w-full">
        <Plus size={18} />
        Nuevo Payómetro
      </Link>

      {/* Invite modal */}
      {invitePayometer && (
        <InviteModal payometer={invitePayometer} onClose={() => setInvitePayometer(null)} />
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-sm animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{confirm.action === 'delete' ? '🗑️' : '🚪'}</div>
              <button onClick={() => setConfirm(null)} className="text-[#6C6C70] hover:text-[#F2F2F7]">
                <X size={18} />
              </button>
            </div>
            <h3 className="font-bold text-lg mb-1">
              {confirm.action === 'delete' ? 'Eliminar grupo' : 'Salirse del grupo'}
            </h3>
            <p className="text-[#8E8E93] text-sm mb-6">
              {confirm.action === 'delete'
                ? <>¿Seguro que quieres eliminar <strong className="text-[#F2F2F7]">{confirm.name}</strong>? Se borrarán todos los puntos e historial. Esta acción no se puede deshacer.</>
                : <>¿Seguro que quieres salirte de <strong className="text-[#F2F2F7]">{confirm.name}</strong>?</>
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={() => confirm.action === 'delete' ? handleDelete(confirm.id) : handleLeave(confirm.id)}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 py-3 active:scale-95 transition-all duration-150 disabled:opacity-40"
              >
                {actionLoading ? 'Cargando…' : confirm.action === 'delete' ? 'Eliminar' : 'Salirse'}
              </button>
            </div>
          </div>
        </div>
      )}
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
