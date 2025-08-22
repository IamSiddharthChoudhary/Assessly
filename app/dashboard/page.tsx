import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Calendar, Users, Clock, BarChart3, Settings, FileText } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user's interviews
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .or(`interviewer_id.eq.${data.user.id},candidate_id.eq.${data.user.id}`)
    .order("scheduled_at", { ascending: true })

  const upcomingInterviews =
    interviews?.filter(
      (interview) => interview.status === "scheduled" && new Date(interview.scheduled_at) > new Date(),
    ) || []

  const recentInterviews = interviews?.filter((interview) => interview.status === "completed").slice(0, 5) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name || data.user.email}</p>
            </div>
            <div className="flex gap-4">
              {profile?.role === "interviewer" && (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/analytics">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/interviews/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Interview
                    </Link>
                  </Button>
                </>
              )}
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/dashboard/interviews">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All Interviews</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{interviews?.length || 0}</div>
                <p className="text-xs text-muted-foreground">View and manage</p>
              </CardContent>
            </Link>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingInterviews.length}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviews?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentInterviews.length}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Interviews</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/interviews">View All</Link>
                </Button>
              </div>
              <CardDescription>Your scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming interviews</p>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.slice(0, 3).map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{interview.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(interview.scheduled_at).toLocaleDateString()} at{" "}
                          {new Date(interview.scheduled_at).toLocaleTimeString()}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {interview.duration_minutes} min
                        </Badge>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/interview/${interview.room_id}`}>Join</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Interviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Interviews</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/interviews">View All</Link>
                </Button>
              </div>
              <CardDescription>Your completed interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {recentInterviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent interviews</p>
              ) : (
                <div className="space-y-4">
                  {recentInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{interview.title}</h3>
                        <p className="text-sm text-gray-600">{new Date(interview.scheduled_at).toLocaleDateString()}</p>
                        <Badge variant="outline" className="mt-1">
                          Completed
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/interviews/${interview.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
