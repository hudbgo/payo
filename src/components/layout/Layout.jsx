import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Plus, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch (e) {
      console.error(e)
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-bold text-lg tracking-tight">Payómetro</span>
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-7 h-7 rounded-full bg-[#2C2C2E]"
                />
                <span className="hidden sm:block font-medium text-[#F2F2F7]">{profile.username}</span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="p-2 rounded-xl hover:bg-[#2C2C2E] transition-colors text-[#8E8E93] hover:text-[#F2F2F7]"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-white/5 safe-bottom">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-around">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-colors ${
                isActive ? 'text-accent' : 'text-[#6C6C70] hover:text-[#8E8E93]'
              }`
            }
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Inicio</span>
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-colors ${
                isActive ? 'text-accent' : 'text-[#6C6C70] hover:text-[#8E8E93]'
              }`
            }
          >
            <Plus size={22} />
            <span className="text-[10px] font-medium">Crear</span>
          </NavLink>
          <NavLink
            to={profile ? `/profile` : '/'}
            className="flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl text-[#6C6C70] hover:text-[#8E8E93] transition-colors"
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Perfil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
