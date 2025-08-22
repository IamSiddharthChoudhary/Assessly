"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, MonitorOff } from "lucide-react"

interface VideoCallProps {
  interviewId: string
  currentUserId: string
  isVideoOn: boolean
  isAudioOn: boolean
  onVideoToggle: () => void
  onAudioToggle: () => void
}

export default function VideoCall({
  interviewId,
  currentUserId,
  isVideoOn,
  isAudioOn,
  onVideoToggle,
  onAudioToggle,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const supabase = createClient()

  useEffect(() => {
    initializeWebRTC()
    setupSignalingChannel()

    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (localStreamRef.current) {
      // Toggle video track
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = isVideoOn
      }

      // Toggle audio track
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isAudioOn
      }
    }
  }, [isVideoOn, isAudioOn])

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Create peer connection
      const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }

      const peerConnection = new RTCPeerConnection(configuration)
      peerConnectionRef.current = peerConnection

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
        }
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage({
            type: "ice-candidate",
            candidate: event.candidate,
            sender: currentUserId,
          })
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        setConnectionStatus(peerConnection.connectionState)
        setIsConnected(peerConnection.connectionState === "connected")
      }

      setConnectionStatus("Initialized")
    } catch (error) {
      console.error("Error initializing WebRTC:", error)
      setConnectionStatus("Error: Camera/microphone access denied")
    }
  }

  const setupSignalingChannel = () => {
    const channel = supabase.channel(`webrtc_${interviewId}`)

    channel
      .on("broadcast", { event: "signaling" }, ({ payload }) => {
        if (payload.sender !== currentUserId) {
          handleSignalingMessage(payload)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  const sendSignalingMessage = (message: any) => {
    supabase.channel(`webrtc_${interviewId}`).send({
      type: "broadcast",
      event: "signaling",
      payload: message,
    })
  }

  const handleSignalingMessage = async (message: any) => {
    const peerConnection = peerConnectionRef.current
    if (!peerConnection) return

    try {
      switch (message.type) {
        case "offer":
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer))
          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)
          sendSignalingMessage({
            type: "answer",
            answer: answer,
            sender: currentUserId,
          })
          break

        case "answer":
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer))
          break

        case "ice-candidate":
          await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
          break
      }
    } catch (error) {
      console.error("Error handling signaling message:", error)
    }
  }

  const startCall = async () => {
    const peerConnection = peerConnectionRef.current
    if (!peerConnection) return

    try {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      sendSignalingMessage({
        type: "offer",
        offer: offer,
        sender: currentUserId,
      })
      setConnectionStatus("Calling...")
    } catch (error) {
      console.error("Error starting call:", error)
    }
  }

  const endCall = () => {
    cleanup()
    setIsConnected(false)
    setConnectionStatus("Call ended")
  }

  const toggleScreenShare = async () => {
    try {
      const peerConnection = peerConnectionRef.current
      if (!peerConnection || !localStreamRef.current) return

      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video")

        if (sender) {
          await sender.replaceTrack(videoTrack)
        }

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare()
        }

        setIsScreenSharing(true)
      } else {
        stopScreenShare()
      }
    } catch (error) {
      console.error("Error toggling screen share:", error)
    }
  }

  const stopScreenShare = async () => {
    try {
      const peerConnection = peerConnectionRef.current
      if (!peerConnection || !localStreamRef.current) return

      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Replace video track
      const videoTrack = cameraStream.getVideoTracks()[0]
      const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video")

      if (sender) {
        await sender.replaceTrack(videoTrack)
      }

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream
      }

      localStreamRef.current = cameraStream
      setIsScreenSharing(false)
    } catch (error) {
      console.error("Error stopping screen share:", error)
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  return (
    <div className="h-full bg-gray-900 relative">
      {/* Remote Video (Main) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded border-2 border-white overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
        {connectionStatus}
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <Button
          variant={isVideoOn ? "default" : "destructive"}
          size="sm"
          onClick={onVideoToggle}
          className="rounded-full w-12 h-12"
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={isAudioOn ? "default" : "destructive"}
          size="sm"
          onClick={onAudioToggle}
          className="rounded-full w-12 h-12"
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={isScreenSharing ? "default" : "outline"}
          size="sm"
          onClick={toggleScreenShare}
          className="rounded-full w-12 h-12"
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </Button>

        {!isConnected ? (
          <Button onClick={startCall} size="sm" className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700">
            <Phone className="w-5 h-5" />
          </Button>
        ) : (
          <Button onClick={endCall} size="sm" className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700">
            <PhoneOff className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* No Remote Video Placeholder */}
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm opacity-75">Waiting for other participant...</p>
            <Button onClick={startCall} className="mt-4 bg-blue-600 hover:bg-blue-700">
              Start Call
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
