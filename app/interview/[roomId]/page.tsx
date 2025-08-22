import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InterviewRoom from "@/components/interview-room";

interface InterviewPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { roomId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("room_id", roomId)
    .single();

  if (!interview) {
    redirect("/dashboard");
  }

  const isAuthorized =
    interview.interviewer_id === data.user.id ||
    interview.candidate_id === data.user.id ||
    interview.candidate_id === null;

  if (!isAuthorized) {
    redirect("/dashboard");
  }

  let { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("interview_id", interview.id)
    .single();

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
      .single();

    session = newSession;
  }

  return (
    <InterviewRoom
      interview={interview}
      session={session}
      currentUserId={data.user.id}
    />
  );
}
