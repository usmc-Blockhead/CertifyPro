import React, { useEffect, useState } from 'react'
import { Play, Clock, BarChart3, Settings } from 'lucide-react'
import { supabase, Category } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function Tests() {
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(20)
  const [timeLimit, setTimeLimit] = useState(30)
  const [loading, setLoading] = useState(true)
  const [startingTest, setStartingTest] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const startTest = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category')
      return
    }

    setStartingTest(true)
    try {
      // Create a new test session
      const { data: session, error } = await supabase
        .from('test_sessions')
        .insert([
          {
            user_id: profile!.id,
            session_name: `Practice Test - ${new Date().toLocaleDateString()}`,
            total_questions: questionCount,
            time_limit_minutes: timeLimit,
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Redirect to test taking interface
      window.location.href = `/test/${session.id}`
    } catch (error) {
      console.error('Error starting test:', error)
      alert('Failed to start test. Please try again.')
    } finally {
      setStartingTest(false)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Practice Tests</h1>
        <p className="mt-2 text-gray-600">
          Configure and start your IT certification practice exam
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Test Settings
              </h2>
              
              {/* Question Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                  <option value={50}>50 Questions</option>
                  <option value={90}>90 Questions (Full Exam)</option>
                </select>
              </div>

              {/* Time Limit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes (Full Exam)</option>
                </select>
              </div>

              {/* Test Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center text-blue-700 mb-2">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="font-medium">Test Overview</span>
                </div>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• {questionCount} questions from selected categories</li>
                  <li>• {timeLimit} minute time limit</li>
                  <li>• Mix of multiple choice and performance-based questions</li>
                  <li>• Detailed explanations after completion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Select Categories
            </h2>
            
            <div className="space-y-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {selectedCategories.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                Please select at least one category to start the test.
              </p>
            )}
          </div>
        </div>

        {/* Start Test Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={startTest}
            disabled={selectedCategories.length === 0 || startingTest}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {startingTest ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Starting Test...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Practice Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}