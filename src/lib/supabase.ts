import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'student' | 'admin'
  total_tests_taken: number
  average_score: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  created_at: string
}

export interface Question {
  id: string
  category_id: string
  type: 'multiple_choice' | 'pbq'
  question_text: string
  explanation?: string
  image_url?: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  time_limit_seconds: number
  created_by?: string
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
  options?: QuestionOption[]
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  explanation?: string
  created_at: string
}

export interface TestSession {
  id: string
  user_id: string
  session_name: string
  total_questions: number
  time_limit_minutes: number
  started_at: string
  completed_at?: string
  is_completed: boolean
  score: number
  percentage: number
  created_at: string
}

export interface TestResult {
  id: string
  session_id: string
  question_id: string
  user_answer?: string
  selected_option_id?: string
  is_correct: boolean
  points_earned: number
  time_spent_seconds: number
  created_at: string
  question?: Question
}

export interface UserProgress {
  id: string
  user_id: string
  category_id: string
  questions_attempted: number
  questions_correct: number
  average_score: number
  last_studied_at: string
  created_at: string
  updated_at: string
  category?: Category
}