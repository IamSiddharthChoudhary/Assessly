import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import InterviewRoom from "@/components/interview-room"

interface InterviewPageProps {
  params: {
    roomId: string
  }
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get interview details
  const { data: interview } = await supabase.from("interviews").select("*").eq("room_id", params.roomId).single()

  if (!interview) {
    redirect("/dashboard")
  }

  // Check if user is authorized for this interview
  const isAuthorized =
    interview.interviewer_id === data.user.id ||
    interview.candidate_id === data.user.id ||
    interview.candidate_id === null // Open room

  if (!isAuthorized) {
    redirect("/dashboard")
  }

  // Get or create interview session
  let { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("interview_id", interview.id)
    .single()

  if (!session) {
    const { data: newSession } = await supabase
      .from("interview_sessions")
      .insert({
        interview_id: interview.id,
        code_content:
          "// Welcome to your coding interview!\n// You can start coding here...\n\nfunction solution() {\n    // Your code here\n}",
        language: "javascript",
      })
      .select()
      .single()

    session = newSession
  }

  return <InterviewRoom interview={interview} session={session} currentUserId={data.user.id} />
}
