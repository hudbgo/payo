import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center animate-slide-up card p-8">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold mb-2">Email enviado</h2>
          <p className="text-[#8E8E93] text-sm mb-6">
            Revisa tu bandeja de entrada para restablecer tu contraseña.
          </p>
          <Link to="/login" className="btn-primary inline-block">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
          <p className="text-[#8E8E93] mt-1 text-sm">Te enviaremos un enlace de recuperación</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-accent hover:underline">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    setError('')
    setLoading(true)
    try {
      const { supabase } = await import('../lib/supabase')
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center card p-8 animate-slide-up">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">Contraseña actualizada</h2>
          <Link to="/login" className="btn-primary inline-block mt-4">Iniciar sesión</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold">Nueva contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nueva contraseña</label>
            <input
              type="password"
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
