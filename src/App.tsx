import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Inbox3WalletProvider } from './context/WalletProvider'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import WalletConnectPage from './pages/WalletConnectPage'
import KeylessAuthPage from './pages/KeylessAuthPage'
import ProfilePage from './pages/ProfilePage'
import MainApp from './pages/MainApp'
import GithubCallbackPage from './pages/GithubCallbackPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={user ? <Navigate to="/app" replace /> : <SignupPage />} />
        <Route path="/login" element={user ? <Navigate to="/app" replace /> : <LoginPage />} />
        <Route path="/wallet" element={user ? <Navigate to="/app" replace /> : <WalletConnectPage />} />
        <Route path="/keyless" element={user ? <Navigate to="/app" replace /> : <KeylessAuthPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/auth/github/callback" element={<GithubCallbackPage />} />
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
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Inbox3WalletProvider>
            <AppRoutes />
          </Inbox3WalletProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
