-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'interviewer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  interviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  room_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coding problems table
CREATE TABLE IF NOT EXISTS public.coding_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT NOT NULL DEFAULT 'javascript',
  starter_code TEXT,
  solution TEXT,
  test_cases JSONB,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview sessions table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  code_content TEXT DEFAULT '',
  language TEXT DEFAULT 'javascript',
  notes TEXT DEFAULT '',
  whiteboard_data JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for interviews
CREATE POLICY "Users can view interviews they're part of" ON public.interviews
  FOR SELECT USING (auth.uid() = interviewer_id OR auth.uid() = candidate_id);

CREATE POLICY "Interviewers can create interviews" ON public.interviews
  FOR INSERT WITH CHECK (auth.uid() = interviewer_id);

CREATE POLICY "Interviewers can update their interviews" ON public.interviews
  FOR UPDATE USING (auth.uid() = interviewer_id);

-- RLS Policies for coding problems
CREATE POLICY "Anyone can view coding problems" ON public.coding_problems
  FOR SELECT USING (true);

CREATE POLICY "Users can create coding problems" ON public.coding_problems
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their coding problems" ON public.coding_problems
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for interview sessions
CREATE POLICY "Users can view sessions for their interviews" ON public.interview_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interviews 
      WHERE interviews.id = interview_sessions.interview_id 
      AND (interviews.interviewer_id = auth.uid() OR interviews.candidate_id = auth.uid())
    )
  );

CREATE POLICY "Users can update sessions for their interviews" ON public.interview_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.interviews 
      WHERE interviews.id = interview_sessions.interview_id 
      AND (interviews.interviewer_id = auth.uid() OR interviews.candidate_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert sessions for their interviews" ON public.interview_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interviews 
      WHERE interviews.id = interview_sessions.interview_id 
      AND (interviews.interviewer_id = auth.uid() OR interviews.candidate_id = auth.uid())
    )
  );

-- RLS Policies for chat messages
CREATE POLICY "Users can view messages for their interviews" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interviews 
      WHERE interviews.id = chat_messages.interview_id 
      AND (interviews.interviewer_id = auth.uid() OR interviews.candidate_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their interviews" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.interviews 
      WHERE interviews.id = chat_messages.interview_id 
      AND (interviews.interviewer_id = auth.uid() OR interviews.candidate_id = auth.uid())
    )
  );
