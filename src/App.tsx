import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout'
import { Auth } from './components/Auth'
import { Dashboard } from './pages/Dashboard'
import { Tests } from './pages/Tests'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tests" element={<Tests />} />
          <Route 
            path="/progress" 
            element={
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Progress Tracking</h1>
                <p className="text-gray-600">Coming soon! Track your learning progress across all categories.</p>
              </div>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h1>
                <p className="text-gray-600">Coming soon! Manage your account settings and preferences.</p>
              </div>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App