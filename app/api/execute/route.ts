import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface ExecutionRequest {
  code: string
  language: string
  input?: string
  timeLimit?: number
}

interface ExecutionResult {
  output: string
  error?: string
  executionTime: number
  memoryUsage?: number
  status: "success" | "error" | "timeout"
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code, language, input = "", timeLimit = 5000 }: ExecutionRequest = await request.json()

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 })
    }

    const result = await executeCode(code, language, input, timeLimit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Code execution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function executeCode(code: string, language: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  const startTime = Date.now()

  try {
    switch (language) {
      case "javascript":
      case "typescript":
        return await executeJavaScript(code, input, timeLimit)
      case "python":
        return await executePython(code, input, timeLimit)
      case "java":
        return await executeJava(code, input, timeLimit)
      case "cpp":
        return await executeCpp(code, input, timeLimit)
      case "c":
        return await executeC(code, input, timeLimit)
      case "go":
        return await executeGo(code, input, timeLimit)
      case "rust":
        return await executeRust(code, input, timeLimit)
      default:
        return {
          output: "",
          error: `Language ${language} is not supported`,
          executionTime: Date.now() - startTime,
          status: "error",
        }
    }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "Unknown execution error",
      executionTime: Date.now() - startTime,
      status: "error",
    }
  }
}

async function executeJavaScript(code: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  const startTime = Date.now()

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        output: "",
        error: "Execution timed out",
        executionTime: timeLimit,
        status: "timeout",
      })
    }, timeLimit)

    try {
      let output = ""
      let errorOutput = ""

      // Create a safe execution context
      const originalConsoleLog = console.log
      const originalConsoleError = console.error

      console.log = (...args) => {
        output += args.join(" ") + "\n"
      }

      console.error = (...args) => {
        errorOutput += args.join(" ") + "\n"
      }

      // Add input handling
      const inputLines = input.split("\n")
      let inputIndex = 0

      // Mock readline for input
      const readline = {
        question: (prompt: string, callback: (answer: string) => void) => {
          if (inputIndex < inputLines.length) {
            callback(inputLines[inputIndex++])
          } else {
            callback("")
          }
        },
      }

      // Create execution context
      const context = {
        console,
        readline,
        setTimeout: (fn: Function, delay: number) => {
          if (delay > 1000) delay = 1000 // Limit delays
          return setTimeout(fn, delay)
        },
        setInterval: () => {
          throw new Error("setInterval is not allowed")
        },
        require: () => {
          throw new Error("require is not allowed")
        },
        process: undefined,
        global: undefined,
        Buffer: undefined,
        __dirname: undefined,
        __filename: undefined,
      }

      // Execute code in context
      const func = new Function(...Object.keys(context), code)
      func(...Object.values(context))

      // Restore console
      console.log = originalConsoleLog
      console.error = originalConsoleError

      clearTimeout(timeout)
      resolve({
        output: output || "Code executed successfully (no output)",
        error: errorOutput || undefined,
        executionTime: Date.now() - startTime,
        status: errorOutput ? "error" : "success",
      })
    } catch (error) {
      clearTimeout(timeout)
      resolve({
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime: Date.now() - startTime,
        status: "error",
      })
    }
  })
}

async function executePython(code: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  // Simulated Python execution (in a real implementation, you'd use a sandboxed Python interpreter)
  const startTime = Date.now()

  // Basic Python syntax validation and simulation
  const lines = code.split("\n")
  let output = ""
  let hasError = false
  let errorMessage = ""

  try {
    // Simple Python simulation for common patterns
    if (code.includes("print(")) {
      const printMatches = code.match(/print$$(.*?)$$/g)
      if (printMatches) {
        printMatches.forEach((match) => {
          const content = match.replace(/print$$|$$/g, "")
          // Simple evaluation for strings and basic expressions
          if (content.startsWith('"') && content.endsWith('"')) {
            output += content.slice(1, -1) + "\n"
          } else if (content.startsWith("'") && content.endsWith("'")) {
            output += content.slice(1, -1) + "\n"
          } else {
            output += `${content}\n`
          }
        })
      }
    }

    if (!output) {
      output = "Python code executed (simulated - full Python execution requires server-side interpreter)"
    }
  } catch (error) {
    hasError = true
    errorMessage = error instanceof Error ? error.message : "Python execution error"
  }

  return {
    output,
    error: hasError ? errorMessage : undefined,
    executionTime: Date.now() - startTime,
    status: hasError ? "error" : "success",
  }
}

async function executeJava(code: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  const startTime = Date.now()

  return {
    output:
      "Java code compilation and execution requires a server-side Java runtime.\nThis is a simulated response for demonstration.",
    executionTime: Date.now() - startTime,
    status: "success",
  }
}

async function executeCpp(code: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  const startTime = Date.now()

  return {
    output:
      "C++ code compilation and execution requires a server-side compiler.\nThis is a simulated response for demonstration.",
    executionTime: Date.now() - startTime,
    status: "success",
  }
}

async function executeC(code: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  const startTime = Date.now()

  return {
    output:
      "C code compilation and execution requires a server-side compiler.\nThis is a simulated response for demonstration.",
    executionTime: Date.now() - startTime,
    status: "success",
  }
}

async function executeGo(code: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  const startTime = Date.now()

  return {
    output:
      "Go code compilation and execution requires a server-side Go runtime.\nThis is a simulated response for demonstration.",
    executionTime: Date.now() - startTime,
    status: "success",
  }
}

async function executeRust(code: string, input: string, timeLimit: number): Promise<ExecutionResult> {
  const startTime = Date.now()

  return {
    output:
      "Rust code compilation and execution requires a server-side Rust compiler.\nThis is a simulated response for demonstration.",
    executionTime: Date.now() - startTime,
    status: "success",
  }
}
