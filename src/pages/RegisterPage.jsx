import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (username.length < 3) { setError('El nombre debe tener al menos 3 caracteres.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    try {
      await signUp(email, password, username)
      setSuccess(true)
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Ya existe una cuenta con este email.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-[#0A0A0F] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center animate-slide-up card p-8">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold mb-2">¡Revisa tu email!</h2>
          <p className="text-[#8E8E93] text-sm">
            Te hemos enviado un enlace de confirmación a <strong className="text-[#F2F2F7]">{email}</strong>.
            Confírmalo para activar tu cuenta.
          </p>
          <Link to="/login" className="btn-primary inline-block mt-6">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-float inline-block">🏆</div>
          <h1 className="text-3xl font-bold tracking-tight">Crear cuenta</h1>
          <p className="text-[#8E8E93] mt-1 text-sm">Únete a Payómetro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre de usuario</label>
            <input
              type="text"
              className="input-field"
              placeholder="elmaspayo"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              maxLength={20}
            />
          </div>

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

          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6C70] hover:text-[#8E8E93] transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent animate-fade-in">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#6C6C70]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
