import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@material-tailwind/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SessionProvider } from './contexts/SessionContext'
import { PermissionsProvider } from './contexts/PermissionsContext'
import { ToastProvider } from './contexts/ToastContext'
import { ConfirmProvider } from './contexts/ConfirmContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { AppThemeProvider } from './contexts/AppThemeContext'
import { initThemeFromStorage } from './themes/initTheme'
import './index.css'
import './styles/themes.css'
import './styles/login-enterprise.css'
import './styles/app-surfaces.css'
import './styles/kaizen-enterprise.css'
import './styles/workflows-enterprise.css'
import './styles/saas-2026.css'
import './styles/enterprise-refinement.css'
import './styles/dark-theme.css'
import './styles/micro-interactions.css'
import './styles/select.css'

initThemeFromStorage()
import './bootstrap-custom.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    // Optional: log error to a monitoring service
    try {
      console.error('UI error captured:', error, info)
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="text-center">
            <h2 className="h5 fw-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-muted mb-3">Please try going back or reloading the page.</p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="kz-btn-secondary"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                className="kz-btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Create a QueryClient instance with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
  },
])

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AppThemeProvider>
      <SessionProvider>
        <PermissionsProvider>
          <ToastProvider>
            <ConfirmProvider>
              <LoadingProvider>
                <ThemeProvider>
                  <ErrorBoundary>
                    <RouterProvider
                      router={router}
                      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
                    />
                  </ErrorBoundary>
                </ThemeProvider>
              </LoadingProvider>
            </ConfirmProvider>
          </ToastProvider>
        </PermissionsProvider>
      </SessionProvider>
    </AppThemeProvider>
  </QueryClientProvider>,
)
