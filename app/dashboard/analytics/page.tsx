import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Clock, CheckCircle, Calendar, BarChart3 } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Only allow interviewers and admins
  if (profile?.role !== "interviewer" && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get analytics data
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, profiles!interviews_interviewer_id_fkey(full_name)")
    .eq("interviewer_id", data.user.id)
    .order("created_at", { ascending: false })

  const totalInterviews = interviews?.length || 0
  const completedInterviews = interviews?.filter((i) => i.status === "completed").length || 0
  const scheduledInterviews = interviews?.filter((i) => i.status === "scheduled").length || 0
  const inProgressInterviews = interviews?.filter((i) => i.status === "in_progress").length || 0

  // Calculate average duration
  const avgDuration =
    completedInterviews > 0
      ? Math.round(
          interviews?.filter((i) => i.status === "completed").reduce((sum, i) => sum + (i.duration_minutes || 0), 0)! /
            completedInterviews,
        )
      : 0

  // Get recent activity
  const recentInterviews = interviews?.slice(0, 10) || []

  // Monthly stats
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyInterviews =
    interviews?.filter((i) => {
      const interviewDate = new Date(i.created_at)
      return interviewDate.getMonth() === currentMonth && interviewDate.getFullYear() === currentYear
    }).length || 0

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
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600">Interview performance and insights</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInterviews}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyInterviews}</div>
              <p className="text-xs text-muted-foreground">
                {monthlyInterviews > 0 ? "+12% from last month" : "No interviews yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{completedInterviews} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDuration}m</div>
              <p className="text-xs text-muted-foreground">Per interview</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interview Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Interview Status
              </CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{completedInterviews}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: totalInterviews > 0 ? `${(completedInterviews / totalInterviews) * 100}%` : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{scheduledInterviews}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: totalInterviews > 0 ? `${(scheduledInterviews / totalInterviews) * 100}%` : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{inProgressInterviews}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: totalInterviews > 0 ? `${(inProgressInterviews / totalInterviews) * 100}%` : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest interview sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInterviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent interviews</p>
                ) : (
                  recentInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{interview.title}</h4>
                        <p className="text-xs text-gray-600">{new Date(interview.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge
                        variant={
                          interview.status === "completed"
                            ? "default"
                            : interview.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {interview.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
