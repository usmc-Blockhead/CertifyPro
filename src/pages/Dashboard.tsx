import React, { useEffect, useState } from 'react'
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, TestSession, Category, UserProgress } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { profile } = useAuth()
  const [recentSessions, setRecentSessions] = useState<TestSession[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      loadDashboardData()
    }
  }, [profile])

  const loadDashboardData = async () => {
    try {
      // Load recent test sessions
      const { data: sessions } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      // Load user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', profile!.id)

      setRecentSessions(sessions || [])
      setCategories(categoriesData || [])
      setProgress(progressData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.full_name || 'Student'}!
        </h1>
        <p className="text-blue-100">
          Ready to continue your IT certification journey?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tests Taken</p>
              <p className="text-2xl font-semibold text-gray-900">
                {profile?.total_tests_taken || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {profile?.average_score?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories Studied</p>
              <p className="text-2xl font-semibold text-gray-900">
                {progress.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Best Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {recentSessions.length > 0 
                  ? Math.max(...recentSessions.map(s => s.percentage)).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Tests</h2>
          </div>
          <div className="p-6">
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{session.session_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        session.percentage >= 70 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {session.percentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.total_questions} questions
                      </p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/tests"
                  className="flex items-center justify-center p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View all tests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No tests taken yet</p>
                <Link
                  to="/tests"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start your first test
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Study Progress */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Study Progress</h2>
          </div>
          <div className="p-6">
            {progress.length > 0 ? (
              <div className="space-y-4">
                {progress.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.category?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.average_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${item.average_score}%`,
                          backgroundColor: item.category?.color || '#3b82f6'
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.questions_correct} / {item.questions_attempted} questions correct
                    </p>
                  </div>
                ))}
                <Link
                  to="/progress"
                  className="flex items-center justify-center p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View detailed progress
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No progress data yet</p>
                <p className="text-sm text-gray-400">Take a test to start tracking your progress</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/tests"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Start Practice Test</p>
              <p className="text-sm text-gray-500">Take a new practice exam</p>
            </div>
          </Link>
          
          <Link
            to="/progress"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Progress</p>
              <p className="text-sm text-gray-500">Track your learning journey</p>
            </div>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Award className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Update Profile</p>
              <p className="text-sm text-gray-500">Manage your account settings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}