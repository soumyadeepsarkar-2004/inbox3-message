import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { WalletProvider } from './context/WalletProvider'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import WalletConnectPage from './pages/WalletConnectPage'
import ProfilePage from './pages/ProfilePage'
import MainApp from './pages/MainApp'
import BackgroundCanvas from './components/canvas/BackgroundCanvas'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <BackgroundCanvas />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={user ? <Navigate to="/app" replace /> : <SignupPage />} />
          <Route path="/login" element={user ? <Navigate to="/app" replace /> : <LoginPage />} />
          <Route path="/wallet" element={user ? <Navigate to="/app" replace /> : <WalletConnectPage />} />
          <Route path="/profile" element={user ? <Navigate to="/app" replace /> : <ProfilePage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <AppRoutes />
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
