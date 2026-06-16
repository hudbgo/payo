import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-float inline-block">🏆</div>
          <h1 className="text-3xl font-bold tracking-tight">Payómetro</h1>
          <p className="text-[#8E8E93] mt-1 text-sm">Compite por ser el más payo</p>
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
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-accent hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-[#6C6C70]">
          ¿No tienes cuenta?{' '}
          <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-accent font-semibold hover:underline">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}
