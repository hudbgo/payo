import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function JoinPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | found | joined | error | already
  const [payometer, setPayometer] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    findPayometer()
  }, [code])

  async function findPayometer() {
    const { data, error } = await supabase
      .from('payometers')
      .select('*')
      .eq('invite_code', code.toUpperCase())
      .single()

    if (error || !data) {
      setStatus('error')
      setError('Código de invitación no encontrado o inválido.')
      return
    }

    setPayometer(data)

    if (user) {
      // Check if already member
      const { data: mem } = await supabase
        .from('memberships')
        .select('id')
        .eq('payometer_id', data.id)
        .eq('user_id', user.id)
        .single()

      if (mem) {
        setStatus('already')
      } else {
        setStatus('found')
      }
    } else {
      setStatus('found')
    }
  }

  async function handleJoin() {
    if (!user) {
      navigate(`/login?redirect=/join/${code}`)
      return
    }

    const { error } = await supabase
      .from('memberships')
      .insert({ payometer_id: payometer.id, user_id: user.id, role: 'member' })

    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('joined')
      setTimeout(() => navigate(`/payometer/${payometer.id}`), 1500)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-4xl animate-float">🏆</div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {status === 'error' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Invitación inválida</h2>
            <p className="text-[#8E8E93] text-sm mb-6">{error}</p>
            <Link to="/" className="btn-primary inline-block">Ir al inicio</Link>
          </div>
        )}

        {(status === 'found') && payometer && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-[#8E8E93] text-sm mb-1">Te han invitado a</p>
            <h2 className="text-2xl font-bold mb-1">{payometer.name}</h2>
            {payometer.description && (
              <p className="text-[#8E8E93] text-sm mb-6">{payometer.description}</p>
            )}
            {!user ? (
              <div className="space-y-3">
                <p className="text-sm text-[#8E8E93]">Necesitas una cuenta para unirte.</p>
                <Link to={`/register`} className="btn-primary block">Crear cuenta</Link>
                <Link to={`/login`} className="btn-secondary block">Iniciar sesión</Link>
              </div>
            ) : (
              <button onClick={handleJoin} className="btn-primary w-full">
                Unirme al Payómetro
              </button>
            )}
          </div>
        )}

        {status === 'already' && payometer && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">Ya eres miembro</h2>
            <p className="text-[#8E8E93] text-sm mb-6">Ya perteneces a <strong className="text-[#F2F2F7]">{payometer.name}</strong>.</p>
            <Link to={`/payometer/${payometer.id}`} className="btn-primary inline-block">Ver Payómetro</Link>
          </div>
        )}

        {status === 'joined' && (
          <div className="card p-8 text-center animate-scale-in">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">¡Te has unido!</h2>
            <p className="text-[#8E8E93] text-sm">Redirigiendo al Payómetro…</p>
          </div>
        )}
      </div>
    </div>
  )
}
