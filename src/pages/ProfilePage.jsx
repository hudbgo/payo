import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Lock, Check, AlertCircle, RefreshCw } from 'lucide-react'

const STYLES = ['notionists', 'avataaars', 'bottts', 'pixel-art', 'lorelei', 'micah', 'adventurer', 'fun-emoji', 'icons']

function randomSeeds(count = 9) {
  return Array.from({ length: count }, () => Math.random().toString(36).slice(2, 8))
}

function avatarUrl(style, seed) {
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`
}

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()

  const [username, setUsername] = useState(profile?.username ?? '')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameMsg, setUsernameMsg] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)

  const [selectedStyle, setSelectedStyle] = useState('notionists')
  const [seeds, setSeeds] = useState(() => randomSeeds())
  const [selectedAvatar, setSelectedAvatar] = useState(null) // { style, seed }
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState(null)

  const regenerate = useCallback(() => {
    setSeeds(randomSeeds())
    setSelectedAvatar(null)
    setAvatarMsg(null)
  }, [])

  async function handleSaveAvatar() {
    if (!selectedAvatar) return
    setAvatarLoading(true)
    setAvatarMsg(null)
    try {
      await updateProfile({ avatar_url: avatarUrl(selectedAvatar.style, selectedAvatar.seed) })
      setAvatarMsg({ type: 'ok', text: 'Avatar guardado.' })
      setSelectedAvatar(null)
    } catch (err) {
      setAvatarMsg({ type: 'error', text: err.message })
    } finally {
      setAvatarLoading(false)
    }
  }

  async function handleUpdateUsername(e) {
    e.preventDefault()
    if (username.trim().length < 3) {
      setUsernameMsg({ type: 'error', text: 'Mínimo 3 caracteres.' })
      return
    }
    setUsernameLoading(true)
    setUsernameMsg(null)
    try {
      await updateProfile({ username: username.trim() })
      setUsernameMsg({ type: 'ok', text: 'Nombre actualizado.' })
    } catch (err) {
      setUsernameMsg({ type: 'error', text: err.message })
    } finally {
      setUsernameLoading(false)
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    setPasswordLoading(true)
    setPasswordMsg(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
      if (signInError) throw new Error('La contraseña actual es incorrecta.')
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordMsg({ type: 'ok', text: 'Contraseña actualizada.' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">{user?.email}</p>
      </div>

      {/* Current avatar */}
      <div className="card p-5 flex items-center gap-4">
        <img
          src={profile?.avatar_url ?? avatarUrl('notionists', profile?.username)}
          alt={profile?.username}
          className="w-16 h-16 rounded-full bg-[#2C2C2E]"
        />
        <div>
          <p className="font-semibold">{profile?.username}</p>
          <p className="text-[#8E8E93] text-sm">Tu avatar actual</p>
        </div>
      </div>

      {/* Avatar picker */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🎨</span>
          <h2 className="font-semibold">Cambiar avatar</h2>
        </div>

        {/* Style selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {STYLES.map(s => (
            <button
              key={s}
              onClick={() => { setSelectedStyle(s); setSelectedAvatar(null); setAvatarMsg(null) }}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedStyle === s ? 'bg-accent text-white' : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-[#F2F2F7]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {seeds.map(seed => {
            const url = avatarUrl(selectedStyle, seed)
            const isSelected = selectedAvatar?.seed === seed && selectedAvatar?.style === selectedStyle
            return (
              <button
                key={seed}
                onClick={() => setSelectedAvatar({ style: selectedStyle, seed })}
                className={`rounded-xl p-2 border-2 transition-all ${
                  isSelected ? 'border-accent bg-accent/10' : 'border-transparent bg-[#2C2C2E] hover:border-white/20'
                }`}
              >
                <img src={url} alt="avatar" className="w-full aspect-square rounded-lg" />
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={regenerate} className="btn-secondary flex items-center gap-2 flex-1">
            <RefreshCw size={15} />
            Generar más
          </button>
          <button
            onClick={handleSaveAvatar}
            disabled={!selectedAvatar || avatarLoading}
            className="btn-primary flex-1"
          >
            {avatarLoading ? 'Guardando…' : 'Usar este'}
          </button>
        </div>
        {avatarMsg && <div className="mt-3"><Msg {...avatarMsg} /></div>}
      </div>

      {/* Username */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-accent" />
          <h2 className="font-semibold">Nombre de usuario</h2>
        </div>
        <form onSubmit={handleUpdateUsername} className="space-y-3">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              maxLength={20}
            />
          </div>
          {usernameMsg && <Msg {...usernameMsg} />}
          <button type="submit" disabled={usernameLoading || username === profile?.username} className="btn-primary w-full">
            {usernameLoading ? 'Guardando…' : 'Guardar nombre'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-accent" />
          <h2 className="font-semibold">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label className="label">Contraseña actual</label>
            <input type="password" className="input-field" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <input type="password" className="input-field" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div>
            <label className="label">Confirmar nueva contraseña</label>
            <input type="password" className="input-field" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          {passwordMsg && <Msg {...passwordMsg} />}
          <button type="submit" disabled={passwordLoading} className="btn-primary w-full">
            {passwordLoading ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Msg({ type, text }) {
  const ok = type === 'ok'
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${ok ? 'bg-green-500/10 text-green-400' : 'bg-accent/10 text-accent'}`}>
      {ok ? <Check size={14} /> : <AlertCircle size={14} />}
      {text}
    </div>
  )
}
