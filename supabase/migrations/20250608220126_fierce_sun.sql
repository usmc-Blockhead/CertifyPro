/*
  # IT Certification Practice Test Platform Schema

  1. New Tables
    - `profiles` - User profiles with progress tracking
    - `categories` - Question categories (e.g., Hardware, Software, Security)
    - `questions` - Question bank with type, content, and metadata
    - `question_options` - Multiple choice options for questions
    - `test_sessions` - Individual test attempt sessions
    - `test_results` - User answers and scoring for each session
    - `user_progress` - Track learning progress by category

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access and admin functionality
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  total_tests_taken integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories for organizing questions
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#2563eb',
  created_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'pbq')),
  question_text text NOT NULL,
  explanation text,
  image_url text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points integer DEFAULT 1,
  time_limit_seconds integer DEFAULT 60,
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Question options for multiple choice questions
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  explanation text,
  created_at timestamptz DEFAULT now()
);

-- Test sessions
CREATE TABLE IF NOT EXISTS test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_name text DEFAULT 'Practice Test',
  total_questions integer NOT NULL,
  time_limit_minutes integer DEFAULT 90,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  is_completed boolean DEFAULT false,
  score numeric(5,2) DEFAULT 0.00,
  percentage numeric(5,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Test results for individual questions
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_answer text,
  selected_option_id uuid REFERENCES question_options(id),
  is_correct boolean DEFAULT false,
  points_earned integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0.00,
  last_studied_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Questions policies
CREATE POLICY "Users can view active questions"
  ON questions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Question options policies
CREATE POLICY "Users can view question options"
  ON question_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage question options"
  ON question_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Test sessions policies
CREATE POLICY "Users can view own test sessions"
  ON test_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own test sessions"
  ON test_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own test sessions"
  ON test_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Test results policies
CREATE POLICY "Users can view own test results"
  ON test_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_sessions 
      WHERE test_sessions.id = test_results.session_id 
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own test results"
  ON test_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_sessions 
      WHERE test_sessions.id = session_id 
      AND test_sessions.user_id = auth.uid()
    )
  );

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
  ('Hardware', 'Computer hardware components and troubleshooting', '#ef4444'),
  ('Software', 'Operating systems and applications', '#10b981'),
  ('Networking', 'Network configuration and protocols', '#3b82f6'),
  ('Security', 'Cybersecurity and best practices', '#f59e0b'),
  ('Troubleshooting', 'Problem-solving and diagnostics', '#8b5cf6'),
  ('Mobile Devices', 'Smartphones, tablets, and mobile technologies', '#ec4899')
ON CONFLICT (name) DO NOTHING;