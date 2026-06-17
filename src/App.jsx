import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import CreatePayometerPage from './pages/CreatePayometerPage'
import PayometerPage from './pages/PayometerPage'
import JoinPage from './pages/JoinPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <AppLoader />
  if (!user) return <Navigate to="/login" replace />

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <AppLoader />
  if (user) return <Navigate to="/" replace />

  return children
}

function AppLoader() {
  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl animate-float">🏆</div>
        <div className="text-[#6C6C70] text-sm">
          Cargando Payómetro…
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          <Route
            path="/join/:code"
            element={<JoinPage />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="create" element={<CreatePayometerPage />} />
            <Route path="payometer/:id" element={<PayometerPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
