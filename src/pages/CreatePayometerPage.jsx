import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft } from 'lucide-react'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function CreatePayometerPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es obligatorio.'); return }
    setError('')
    setLoading(true)

    try {
      const inviteCode = generateCode()

      const { data: pm, error: pmErr } = await supabase
        .from('payometers')
        .insert({ name: name.trim(), description: description.trim(), created_by: user.id, invite_code: inviteCode })
        .select()
        .single()

      if (pmErr) throw pmErr

      const { error: memErr } = await supabase
        .from('memberships')
        .insert({ payometer_id: pm.id, user_id: user.id, role: 'admin' })

      if (memErr) throw memErr

      navigate(`/payometer/${pm.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8E8E93] hover:text-[#F2F2F7] mb-6 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm">Volver</span>
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Nuevo Payómetro</h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">Crea un grupo para competir con tus amigos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Nombre del Payómetro *</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ej: Payómetro del trabajo"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            required
          />
          <div className="text-xs text-[#6C6C70] mt-1 text-right">{name.length}/50</div>
        </div>

        <div>
          <label className="label">Descripción (opcional)</label>
          <textarea
            className="input-field resize-none"
            placeholder="¿De qué va este payómetro?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <div className="text-xs text-[#6C6C70] mt-1 text-right">{description.length}/200</div>
        </div>

        {error && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creando…' : '🏆 Crear Payómetro'}
        </button>
      </form>

      <div className="mt-8 card p-4">
        <h3 className="font-semibold text-sm mb-2">¿Cómo funciona?</h3>
        <ul className="space-y-2 text-sm text-[#8E8E93]">
          <li className="flex items-start gap-2">
            <span>1.</span>
            <span>Crea el Payómetro con un nombre y descripción.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>2.</span>
            <span>Comparte el enlace de invitación con tus amigos.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>3.</span>
            <span>Asigna puntos de payo a tus compañeros y sube en el ranking.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
