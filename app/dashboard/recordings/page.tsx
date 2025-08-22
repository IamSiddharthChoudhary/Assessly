"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileVideo, Download, Search, Calendar, Clock, Users } from "lucide-react"

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<any[]>([])
  const [filteredRecordings, setFilteredRecordings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadRecordings()
  }, [])

  useEffect(() => {
    filterRecordings()
  }, [recordings, searchTerm])

  const loadRecordings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("interview_recordings")
      .select(`
        *,
        interviews:interview_id (
          title,
          interviewer_id,
          candidate_id,
          profiles:candidate_id (full_name, email)
        )
      `)
      .eq("recorded_by", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setRecordings(data)
    }
    setLoading(false)
  }

  const filterRecordings = () => {
    if (!searchTerm) {
      setFilteredRecordings(recordings)
      return
    }

    const filtered = recordings.filter(
      (recording) =>
        recording.interviews?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.interviews?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.interviews?.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRecordings(filtered)
  }

  const downloadRecording = (recording: any) => {
    // In a real implementation, this would download from storage
    console.log("Downloading recording:", recording.file_url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Interview Recordings</h1>
        <p className="text-gray-600">Manage and review your interview session recordings</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search recordings by interview title or candidate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Recordings List */}
      {filteredRecordings.length === 0 ? (
        <Card className="p-12 text-center">
          <FileVideo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No recordings found</h3>
          <p className="text-gray-600">
            {searchTerm ? "No recordings match your search criteria." : "You haven't recorded any interviews yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecordings.map((recording) => (
            <Card key={recording.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileVideo className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">{recording.interviews?.title || "Untitled Interview"}</h3>
                    <Badge variant={recording.status === "completed" ? "secondary" : "outline"}>
                      {recording.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        Candidate:{" "}
                        {recording.interviews?.profiles?.full_name ||
                          recording.interviews?.profiles?.email ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {formatTime(recording.duration || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Recorded: {new Date(recording.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {recording.file_size && (
                    <div className="text-sm text-gray-600">File size: {formatFileSize(recording.file_size)}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  {recording.status === "completed" && (
                    <Button onClick={() => downloadRecording(recording)} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
