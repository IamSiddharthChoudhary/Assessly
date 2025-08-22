"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreateInterviewPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [candidateEmail, setCandidateEmail] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [duration, setDuration] = useState("60")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Find candidate by email
      let candidateId = null
      if (candidateEmail) {
        const { data: candidateProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", candidateEmail)
          .single()

        candidateId = candidateProfile?.id || null
      }

      // Generate unique room ID
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create interview
      const { data, error } = await supabase
        .from("interviews")
        .insert({
          title,
          description,
          interviewer_id: user.id,
          candidate_id: candidateId,
          scheduled_at: scheduledAt,
          duration_minutes: Number.parseInt(duration),
          room_id: roomId,
          status: "scheduled",
        })
        .select()
        .single()

      if (error) throw error

      // Create interview session
      await supabase.from("interview_sessions").insert({
        interview_id: data.id,
        code_content:
          "// Welcome to your coding interview!\n// You can start coding here...\n\nfunction solution() {\n    // Your code here\n}",
        language: "javascript",
      })

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Interview</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
            <CardDescription>Set up a new coding interview session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Interview Title</Label>
                <Input
                  id="title"
                  placeholder="Frontend Developer Interview"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Interview for frontend developer position focusing on React and JavaScript..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="candidateEmail">Candidate Email (Optional)</Label>
                <Input
                  id="candidateEmail"
                  type="email"
                  placeholder="candidate@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Leave empty to create an open interview room that can be joined with the room ID
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Interview"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
