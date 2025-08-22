import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ExternalLink, Edit } from "lucide-react";

interface InterviewDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const { data: interview } = await supabase
    .from("interviews")
    .select(
      `
      *,
      interviewer:profiles!interviews_interviewer_id_fkey(full_name, email),
      candidate:profiles!interviews_candidate_id_fkey(full_name, email)
    `
    )
    .eq("id", id)
    .single();

  if (!interview) {
    redirect("/dashboard/interviews");
  }

  const hasAccess =
    interview.interviewer_id === data.user.id ||
    interview.candidate_id === data.user.id ||
    interview.candidate_id === null;

  if (!hasAccess) {
    redirect("/dashboard/interviews");
  }

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("interview_id", interview.id)
    .single();

  const { data: chatMessages } = await supabase
    .from("chat_messages")
    .select(
      `
      *,
      profiles:sender_id (full_name, email)
    `
    )
    .eq("interview_id", interview.id)
    .order("created_at", { ascending: true });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/interviews">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Interviews
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {interview.title}
                </h1>
                <p className="text-gray-600">Interview Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {interview.status === "scheduled" && (
                <Button asChild>
                  <Link href={`/interview/${interview.room_id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Interview
                  </Link>
                </Button>
              )}
              {interview.interviewer_id === data.user.id && (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interview Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interview Information</CardTitle>
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">
                    Description
                  </h4>
                  <p className="text-gray-600">
                    {interview.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">
                      Interviewer
                    </h4>
                    <p className="text-gray-600">
                      {interview.interviewer?.full_name ||
                        interview.interviewer?.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">
                      Candidate
                    </h4>
                    <p className="text-gray-600">
                      {interview.candidate?.full_name ||
                        interview.candidate?.email ||
                        "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">
                      Scheduled Date
                    </h4>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {interview.scheduled_at
                        ? new Date(interview.scheduled_at).toLocaleDateString()
                        : "Not scheduled"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Time</h4>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {interview.scheduled_at
                        ? new Date(interview.scheduled_at).toLocaleTimeString()
                        : "Not scheduled"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Duration</h4>
                    <p className="text-gray-600">
                      {interview.duration_minutes} minutes
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Room ID</h4>
                  <p className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {interview.room_id}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Session Data */}
            {session && (
              <Card>
                <CardHeader>
                  <CardTitle>Session Data</CardTitle>
                  <CardDescription>
                    Code and notes from the interview session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Code ({session.language})
                    </h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-60">
                      {session.code_content || "No code written"}
                    </pre>
                  </div>

                  {session.notes && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {session.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {interview.status === "scheduled" && (
                  <Button asChild className="w-full">
                    <Link href={`/interview/${interview.room_id}`}>
                      Join Interview Room
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  asChild
                  className="w-full bg-transparent"
                >
                  <Link href="/dashboard/interviews">View All Interviews</Link>
                </Button>
                {interview.interviewer_id === data.user.id && (
                  <Button
                    variant="outline"
                    asChild
                    className="w-full bg-transparent"
                  >
                    <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                      Edit Interview
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Chat History */}
            {chatMessages && chatMessages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Chat History</CardTitle>
                  <CardDescription>
                    {chatMessages.length} messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="text-sm">
                        <div className="font-medium text-xs text-gray-600">
                          {message.profiles?.full_name ||
                            message.profiles?.email}
                        </div>
                        <div className="mt-1 text-gray-800">
                          {message.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
