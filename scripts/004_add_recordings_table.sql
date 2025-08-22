-- Create interview_recordings table
CREATE TABLE IF NOT EXISTS interview_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'recording' CHECK (status IN ('recording', 'paused', 'completed', 'failed')),
  duration INTEGER DEFAULT 0, -- Duration in seconds
  file_url TEXT,
  file_size BIGINT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interview_recordings_interview_id ON interview_recordings(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_recordings_recorded_by ON interview_recordings(recorded_by);
CREATE INDEX IF NOT EXISTS idx_interview_recordings_status ON interview_recordings(status);

-- Enable RLS
ALTER TABLE interview_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view recordings for their interviews" ON interview_recordings
  FOR SELECT USING (
    interview_id IN (
      SELECT id FROM interviews 
      WHERE interviewer_id = auth.uid() OR candidate_id = auth.uid()
    )
  );

CREATE POLICY "Interviewers can create recordings" ON interview_recordings
  FOR INSERT WITH CHECK (
    interview_id IN (
      SELECT id FROM interviews WHERE interviewer_id = auth.uid()
    )
  );

CREATE POLICY "Interviewers can update their recordings" ON interview_recordings
  FOR UPDATE USING (
    recorded_by = auth.uid() AND 
    interview_id IN (
      SELECT id FROM interviews WHERE interviewer_id = auth.uid()
    )
  );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_interview_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interview_recordings_updated_at
  BEFORE UPDATE ON interview_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_interview_recordings_updated_at();
