import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Inbox3WalletProvider } from './context/WalletProvider'
import AppShell from './components/layout/AppShell'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import WalletConnectPage from './pages/WalletConnectPage'
import KeylessAuthPage from './pages/KeylessAuthPage'
import ProfilePage from './pages/ProfilePage'
import MainApp from './pages/MainApp'
import GithubCallbackPage from './pages/GithubCallbackPage'
import DocsPage from './pages/DocsPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth()
  if (!initialized) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, initialized } = useAuth()
  if (!initialized) return null

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={user ? <Navigate to="/app" replace /> : <ErrorBoundary><SignupPage /></ErrorBoundary>} />
        <Route path="/login" element={user ? <Navigate to="/app" replace /> : <ErrorBoundary><LoginPage /></ErrorBoundary>} />
        <Route path="/wallet" element={user ? <Navigate to="/app" replace /> : <ErrorBoundary><WalletConnectPage /></ErrorBoundary>} />
        <Route path="/keyless" element={user ? <Navigate to="/app" replace /> : <ErrorBoundary><KeylessAuthPage /></ErrorBoundary>} />
        <Route path="/profile" element={user ? <ErrorBoundary><ProfilePage /></ErrorBoundary> : <Navigate to="/login" replace />} />
        <Route path="/auth/github/callback" element={<ErrorBoundary><GithubCallbackPage /></ErrorBoundary>} />
        <Route path="/docs" element={<ErrorBoundary><DocsPage /></ErrorBoundary>} />
        <Route path="/privacy" element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
        <Route path="/terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <MainApp />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
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
