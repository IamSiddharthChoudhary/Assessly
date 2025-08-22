"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  FileText,
  Users,
  Settings,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import CodeEditor from "@/components/code-editor";
import VideoCall from "@/components/video-call";
import CodeExecutionPanel from "@/components/code-execution-panel";
import RecordingManager from "@/components/recording-manager";

interface InterviewRoomProps {
  interview: any;
  session: any;
  currentUserId: string;
}

export default function InterviewRoom({
  interview,
  session,
  currentUserId,
}: InterviewRoomProps) {
  const [codeContent, setCodeContent] = useState(session?.code_content || "");
  const [language, setLanguage] = useState(session?.language || "javascript");
  const [notes, setNotes] = useState(session?.notes || "");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "code" | "chat" | "notes" | "recording"
  >("code");
  const [executionResult, setExecutionResult] = useState<any>(null);

  const supabase = createClient();

  const codeUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const notesUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadChatMessages();

    const chatSubscription = supabase
      .channel(`interview_${interview.id}_chat`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `interview_id=eq.${interview.id}`,
        },
        (payload) => {
          setChatMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    const sessionSubscription = supabase
      .channel(`interview_${interview.id}_session`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "interview_sessions",
          filter: `interview_id=eq.${interview.id}`,
        },
        (payload) => {
          if (payload.new.code_content !== codeContent) {
            setCodeContent(payload.new.code_content);
          }
          if (payload.new.language !== language) {
            setLanguage(payload.new.language);
          }
          if (payload.new.notes !== notes) {
            setNotes(payload.new.notes);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
      supabase.removeChannel(sessionSubscription);
    };
  }, [interview.id, codeContent, language, notes]);

  const loadChatMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select(
        `
        *,
        profiles:sender_id (full_name, email)
      `
      )
      .eq("interview_id", interview.id)
      .order("created_at", { ascending: true });

    if (data) setChatMessages(data);
  };

  const updateCodeContent = async (content: string) => {
    setCodeContent(content);

    if (codeUpdateTimeout.current) clearTimeout(codeUpdateTimeout.current);
    codeUpdateTimeout.current = setTimeout(async () => {
      await supabase
        .from("interview_sessions")
        .update({
          code_content: content,
          language,
        })
        .eq("id", session.id);
    }, 1000);
  };

  const updateLanguage = async (newLanguage: string) => {
    setLanguage(newLanguage);
    await supabase
      .from("interview_sessions")
      .update({ language: newLanguage })
      .eq("id", session.id);
  };

  const updateNotes = async (content: string) => {
    setNotes(content);

    if (notesUpdateTimeout.current) clearTimeout(notesUpdateTimeout.current);
    notesUpdateTimeout.current = setTimeout(async () => {
      await supabase
        .from("interview_sessions")
        .update({ notes: content })
        .eq("id", session.id);
    }, 1000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await supabase.from("chat_messages").insert({
      interview_id: interview.id,
      sender_id: currentUserId,
      message: newMessage,
    });

    setNewMessage("");
  };

  const handleVideoToggle = () => setIsVideoOn((prev) => !prev);
  const handleAudioToggle = () => setIsAudioOn((prev) => !prev);
  const handleExecutionResult = (result: any) => setExecutionResult(result);

  const isInterviewer = interview.interviewer_id === currentUserId;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <ExternalLink className="w-4 h-4 mr-2" />
                Exit Interview
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold">{interview.title}</h1>
              <p className="text-sm text-gray-600">
                Room ID: {interview.room_id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />2 participants
            </Badge>
            <Button
              variant={isVideoOn ? "default" : "outline"}
              size="sm"
              onClick={handleVideoToggle}
            >
              {isVideoOn ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant={isAudioOn ? "default" : "outline"}
              size="sm"
              onClick={handleAudioToggle}
            >
              {isAudioOn ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Left: Video + Editor */}
        <div className="flex-1 flex flex-col">
          <div className="h-48">
            <VideoCall
              interviewId={interview.id}
              currentUserId={currentUserId}
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              onVideoToggle={handleVideoToggle}
              onAudioToggle={handleAudioToggle}
            />
          </div>

          <div className="flex-1 p-6">
            <div className="h-full flex gap-4">
              <div className="flex-1">
                <CodeEditor
                  value={codeContent}
                  onChange={updateCodeContent}
                  language={language}
                  onLanguageChange={updateLanguage}
                />
              </div>
              <div className="w-96">
                <CodeExecutionPanel
                  code={codeContent}
                  language={language}
                  onExecute={handleExecutionResult}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { key: "code", label: "Problems", icon: FileText },
                { key: "chat", label: "Chat", icon: MessageSquare },
                { key: "notes", label: "Notes" },
                { key: "recording", label: "Record" },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 inline mr-1" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "code" && (
              <div className="p-4 space-y-3">
                <h3 className="font-medium mb-3">Coding Problems</h3>
                <Card className="p-3">
                  <h4 className="font-medium text-sm">Two Sum</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Find two numbers that add up to target
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Easy
                  </Badge>
                </Card>
                <Card className="p-3">
                  <h4 className="font-medium text-sm">Reverse String</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Reverse a string in-place
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Easy
                  </Badge>
                </Card>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <div className="font-medium text-xs text-gray-600">
                        {message.profiles?.full_name || message.profiles?.email}
                      </div>
                      <div className="mt-1">{message.message}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <Button onClick={sendMessage} size="sm">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="p-4 h-full">
                <h3 className="font-medium mb-3">Interview Notes</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="Take notes during the interview..."
                  className="h-full resize-none"
                />
              </div>
            )}

            {activeTab === "recording" && (
              <div className="p-4 h-full overflow-y-auto">
                <RecordingManager
                  interviewId={interview.id}
                  currentUserId={currentUserId}
                  isInterviewer={isInterviewer}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
