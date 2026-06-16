import { useState } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const QUICK_REASONS = [
  { label: '🩴 Chanclas con calcetines', pts: 5 },
  { label: '💪 Llamar "bro" a todo el mundo', pts: 10 },
  { label: '🌅 Historia motivacional a las 6am', pts: 15 },
  { label: '📸 Foto de comida sin comer', pts: 8 },
  { label: '🤳 Selfie en el gym', pts: 12 },
  { label: '🤓 Hablar de productividad en vacaciones', pts: 20 },
]

export default function AddPointsModal({ payometerId, members, currentUserId, onClose, onSuccess }) {
  const { user } = useAuth()
  const [selectedMember, setSelectedMember] = useState(members[0] ?? null)
  const [points, setPoints] = useState(5)
  const [reason, setReason] = useState('')
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function selectQuickReason(qr) {
    setReason(qr.label)
    setPoints(qr.pts)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedMember) { setError('Selecciona un miembro'); return }
    if (!reason.trim()) { setError('El motivo es obligatorio'); return }
    if (points < 1) { setError('Mínimo 1 punto'); return }

    setError('')
    setLoading(true)

    try {
      const { error: err } = await supabase.from('score_events').insert({
        payometer_id: payometerId,
        given_by: user.id,
        received_by: selectedMember.id,
        points,
        reason: reason.trim(),
        event_date: eventDate,
      })

      if (err) throw err
      await onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#1C1C1E] rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 animate-slide-up mx-0 sm:mx-4 max-h-[90dvh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#3A3A3C] rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Asignar puntos de payo</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#2C2C2E] text-[#6C6C70] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Member selector */}
          <div>
            <label className="label">¿A quién?</label>
            <div className="flex gap-2 flex-wrap">
              {members.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    selectedMember?.id === m.id
                      ? 'bg-accent/15 border-accent/40 text-[#F2F2F7]'
                      : 'bg-[#2C2C2E] border-white/10 text-[#8E8E93] hover:border-white/20'
                  }`}
                >
                  <img src={m.avatar_url ?? `https://api.dicebear.com/8.x/notionists/svg?seed=${m.username}`} className="w-5 h-5 rounded-full" alt={m.username} />
                  {m.username}
                </button>
              ))}
            </div>
          </div>

          {/* Points */}
          <div>
            <label className="label">Puntos</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPoints(p => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex items-center justify-center transition-colors"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={1}
                max={999}
                value={points}
                onChange={e => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field text-center font-mono font-bold text-xl w-24 text-payellow"
              />
              <button
                type="button"
                onClick={() => setPoints(p => Math.min(999, p + 1))}
                className="w-10 h-10 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Quick reasons */}
          <div>
            <label className="label">Razones rápidas</label>
            <div className="grid grid-cols-1 gap-1.5">
              {QUICK_REASONS.map(qr => (
                <button
                  key={qr.label}
                  type="button"
                  onClick={() => selectQuickReason(qr)}
                  className={`text-left px-3 py-2 rounded-xl border text-sm transition-all duration-150 ${
                    reason === qr.label
                      ? 'bg-payellow/10 border-payellow/30 text-[#F2F2F7]'
                      : 'bg-[#2C2C2E] border-white/5 text-[#8E8E93] hover:border-white/15'
                  }`}
                >
                  <span>{qr.label}</span>
                  <span className="float-right text-xs text-payellow font-bold">+{qr.pts}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason */}
          <div>
            <label className="label">Motivo personalizado</label>
            <textarea
              className="input-field resize-none"
              placeholder="¿Por qué merece estos puntos?"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Date */}
          <div>
            <label className="label">Fecha del evento</label>
            <input
              type="date"
              className="input-field"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !selectedMember} className="btn-primary w-full">
            {loading ? 'Asignando…' : `⚡ Asignar ${points} pts a ${selectedMember?.username ?? '—'}`}
          </button>
        </form>
      </div>
    </div>
  )
}
