"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Clock, Zap, AlertCircle, CheckCircle } from "lucide-react"

interface CodeExecutionPanelProps {
  code: string
  language: string
  onExecute?: (result: any) => void
}

interface ExecutionResult {
  output: string
  error?: string
  executionTime: number
  memoryUsage?: number
  status: "success" | "error" | "timeout"
}

export default function CodeExecutionPanel({ code, language, onExecute }: CodeExecutionPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [input, setInput] = useState("")
  const [showInput, setShowInput] = useState(false)

  const executeCode = async () => {
    if (!code.trim()) {
      setResult({
        output: "",
        error: "No code to execute",
        executionTime: 0,
        status: "error",
      })
      return
    }

    setIsExecuting(true)
    setResult(null)

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          input,
          timeLimit: 5000,
        }),
      })

      const executionResult = await response.json()

      if (!response.ok) {
        throw new Error(executionResult.error || "Execution failed")
      }

      setResult(executionResult)
      onExecute?.(executionResult)
    } catch (error) {
      const errorResult = {
        output: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        executionTime: 0,
        status: "error" as const,
      }
      setResult(errorResult)
      onExecute?.(errorResult)
    } finally {
      setIsExecuting(false)
    }
  }

  const stopExecution = () => {
    // In a real implementation, this would cancel the execution
    setIsExecuting(false)
    setResult({
      output: "",
      error: "Execution stopped by user",
      executionTime: 0,
      status: "error",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "timeout":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      case "timeout":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Code Execution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInput(!showInput)}>
              {showInput ? "Hide Input" : "Add Input"}
            </Button>
            {isExecuting ? (
              <Button onClick={stopExecution} size="sm" variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button onClick={executeCode} size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {showInput && (
          <div>
            <label className="text-sm font-medium mb-2 block">Input (one value per line)</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input values here..."
              className="h-20 text-sm font-mono"
            />
          </div>
        )}

        {isExecuting && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Executing code...</span>
            </div>
          </div>
        )}

        {result && (
          <div className="flex-1 flex flex-col gap-3">
            {/* Status Bar */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.status)}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="font-medium capitalize">{result.status}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>Time: {result.executionTime}ms</span>
                {result.memoryUsage && <span>Memory: {result.memoryUsage}KB</span>}
              </div>
            </div>

            {/* Output */}
            {result.output && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm">Output</h4>
                  <Badge variant="secondary" className="text-xs">
                    stdout
                  </Badge>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-auto max-h-40 whitespace-pre-wrap">
                  {result.output}
                </pre>
              </div>
            )}

            {/* Error */}
            {result.error && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm text-red-600">Error</h4>
                  <Badge variant="destructive" className="text-xs">
                    stderr
                  </Badge>
                </div>
                <pre className="bg-red-50 text-red-800 p-4 rounded-lg text-sm font-mono overflow-auto max-h-40 whitespace-pre-wrap border border-red-200">
                  {result.error}
                </pre>
              </div>
            )}

            {!result.output && !result.error && result.status === "success" && (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Code executed successfully with no output</p>
              </div>
            )}
          </div>
        )}

        {!result && !isExecuting && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click "Run Code" to execute your {language} code</p>
              <p className="text-sm mt-1">Results will appear here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
