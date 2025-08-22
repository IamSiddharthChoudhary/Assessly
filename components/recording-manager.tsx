"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Download, Clock, FileVideo } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RecordingManagerProps {
  interviewId: string
  currentUserId: string
  isInterviewer: boolean
}

export default function RecordingManager({ interviewId, currentUserId, isInterviewer }: RecordingManagerProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordings, setRecordings] = useState<any[]>([])
  const [currentRecording, setCurrentRecording] = useState<any>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadRecordings()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const loadRecordings = async () => {
    const { data } = await supabase
      .from("interview_recordings")
      .select("*")
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: false })

    if (data) setRecordings(data)
  }

  const startRecording = async () => {
    try {
      // Get screen and audio streams
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true,
      })

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      // Combine streams
      const combinedStream = new MediaStream([...screenStream.getVideoTracks(), ...audioStream.getAudioTracks()])

      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9",
      })

      recordedChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        await saveRecording()
      }

      // Create recording session in database
      const { data: recordingData } = await supabase
        .from("interview_recordings")
        .insert({
          interview_id: interviewId,
          recorded_by: currentUserId,
          status: "recording",
          duration: 0,
        })
        .select()
        .single()

      setCurrentRecording(recordingData)
      mediaRecorderRef.current.start(1000) // Record in 1-second chunks
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      setIsRecording(false)
      setIsPaused(false)

      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const saveRecording = async () => {
    if (recordedChunksRef.current.length === 0 || !currentRecording) return

    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
    const formData = new FormData()
    formData.append("file", blob, `interview-${interviewId}-${Date.now()}.webm`)

    try {
      // In a real implementation, you would upload to a storage service
      // For now, we'll simulate the upload and store metadata
      const recordingUrl = `recordings/interview-${interviewId}-${Date.now()}.webm`

      await supabase
        .from("interview_recordings")
        .update({
          status: "completed",
          duration: recordingTime,
          file_url: recordingUrl,
          file_size: blob.size,
        })
        .eq("id", currentRecording.id)

      setCurrentRecording(null)
      loadRecordings()
    } catch (error) {
      console.error("Error saving recording:", error)
    }
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

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      {isInterviewer && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Session Recording</h3>
            {isRecording && (
              <Badge variant={isPaused ? "secondary" : "destructive"} className="animate-pulse">
                {isPaused ? "PAUSED" : "RECORDING"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                <FileVideo className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button onClick={pauseRecording} variant="outline">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="w-4 h-4" />
                </Button>
              </>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {isRecording && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Recording in progress...</div>
              <Progress value={(recordingTime % 60) * (100 / 60)} className="h-1" />
            </div>
          )}
        </Card>
      )}

      {/* Recordings List */}
      <Card className="p-4">
        <h3 className="font-medium mb-4">Session Recordings</h3>

        {recordings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileVideo className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recordings available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileVideo className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      Recording {new Date(recording.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant={recording.status === "completed" ? "secondary" : "outline"} className="text-xs">
                      {recording.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-x-4">
                    <span>Duration: {formatTime(recording.duration || 0)}</span>
                    {recording.file_size && <span>Size: {formatFileSize(recording.file_size)}</span>}
                    <span>Created: {new Date(recording.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                {recording.status === "completed" && (
                  <Button onClick={() => downloadRecording(recording)} variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
