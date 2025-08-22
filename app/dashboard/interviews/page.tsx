import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Plus, Calendar, Clock, Users, Edit, Eye } from "lucide-react"

export default async function InterviewsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get all interviews for this user
  const { data: interviews } = await supabase
    .from("interviews")
    .select(`
      *,
      interviewer:profiles!interviews_interviewer_id_fkey(full_name, email),
      candidate:profiles!interviews_candidate_id_fkey(full_name, email)
    `)
    .or(`interviewer_id.eq.${data.user.id},candidate_id.eq.${data.user.id}`)
    .order("scheduled_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Interviews</h1>
                <p className="text-gray-600">Manage your interview sessions</p>
              </div>
            </div>
            {profile?.role === "interviewer" && (
              <Button asChild>
                <Link href="/dashboard/interviews/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Interview
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviews?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {interviews?.filter((i) => i.status === "scheduled").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {interviews?.filter((i) => i.status === "completed").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {interviews?.filter((i) => i.status === "in_progress").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Sessions</CardTitle>
            <CardDescription>All your interview sessions and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {!interviews || interviews.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first interview session</p>
                {profile?.role === "interviewer" && (
                  <Button asChild>
                    <Link href="/dashboard/interviews/create">Create Interview</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{interview.title}</h3>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-3">{interview.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Interviewer:</span>
                            <p className="text-gray-600">
                              {interview.interviewer?.full_name || interview.interviewer?.email}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Candidate:</span>
                            <p className="text-gray-600">
                              {interview.candidate?.full_name || interview.candidate?.email || "Not assigned"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Scheduled:</span>
                            <p className="text-gray-600">
                              {interview.scheduled_at
                                ? new Date(interview.scheduled_at).toLocaleString()
                                : "Not scheduled"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {interview.duration_minutes} minutes
                          </span>
                          <span>Room ID: {interview.room_id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/interviews/${interview.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>

                        {interview.status === "scheduled" && (
                          <Button size="sm" asChild>
                            <Link href={`/interview/${interview.room_id}`}>Join</Link>
                          </Button>
                        )}

                        {profile?.role === "interviewer" && interview.interviewer_id === data.user.id && (
                          <>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
