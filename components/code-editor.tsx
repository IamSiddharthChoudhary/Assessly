"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Copy, RotateCcw } from "lucide-react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  onLanguageChange: (language: string) => void
  onRun?: () => void
  readOnly?: boolean
}

const LANGUAGE_MAP: Record<string, { label: string; extension: string }> = {
  javascript: { label: "JavaScript", extension: "js" },
  typescript: { label: "TypeScript", extension: "ts" },
  python: { label: "Python", extension: "py" },
  java: { label: "Java", extension: "java" },
  cpp: { label: "C++", extension: "cpp" },
  c: { label: "C", extension: "c" },
  go: { label: "Go", extension: "go" },
  rust: { label: "Rust", extension: "rs" },
}

export default function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  onRun,
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineNumbers, setLineNumbers] = useState<number[]>([1])

  useEffect(() => {
    updateLineNumbers()
  }, [value])

  const updateLineNumbers = () => {
    const lines = value.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }

    if (e.key === "Enter") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const lines = value.substring(0, start).split("\n")
      const currentLine = lines[lines.length - 1]
      const indent = currentLine.match(/^(\s*)/)?.[1] || ""

      const newValue = value.substring(0, start) + "\n" + indent + value.substring(start)
      onChange(newValue)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length
      }, 0)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const resetCode = () => {
    const starterCode = getStarterCode(language)
    onChange(starterCode)
  }

  const getStarterCode = (lang: string): string => {
    const starters: Record<string, string> = {
      javascript: `// Welcome to your coding interview!
// You can start coding here...

function solution() {
    // Your code here
    return null;
}

// Test your solution
console.log(solution());`,
      typescript: `// Welcome to your coding interview!
// You can start coding here...

function solution(): any {
    // Your code here
    return null;
}

// Test your solution
console.log(solution());`,
      python: `# Welcome to your coding interview!
# You can start coding here...

def solution():
    # Your code here
    return None

# Test your solution
print(solution())`,
      java: `// Welcome to your coding interview!
// You can start coding here...

public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution());
    }
    
    public Object solution() {
        // Your code here
        return null;
    }
}`,
      cpp: `// Welcome to your coding interview!
// You can start coding here...

#include <iostream>
using namespace std;

class Solution {
public:
    auto solution() {
        // Your code here
        return nullptr;
    }
};

int main() {
    Solution sol;
    cout << "Result: " << sol.solution() << endl;
    return 0;
}`,
      c: `// Welcome to your coding interview!
// You can start coding here...

#include <stdio.h>

int solution() {
    // Your code here
    return 0;
}

int main() {
    printf("Result: %d\\n", solution());
    return 0;
}`,
      go: `// Welcome to your coding interview!
// You can start coding here...

package main

import "fmt"

func solution() interface{} {
    // Your code here
    return nil
}

func main() {
    fmt.Println("Result:", solution())
}`,
      rust: `// Welcome to your coding interview!
// You can start coding here...

fn solution() -> Option<i32> {
    // Your code here
    None
}

fn main() {
    println!("Result: {:?}", solution());
}`,
    }

    return starters[lang] || starters.javascript
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_MAP).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
            {LANGUAGE_MAP[language]?.extension || "txt"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-gray-300 hover:text-white">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={resetCode} className="text-gray-300 hover:text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
          {onRun && (
            <Button onClick={onRun} size="sm" className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Line Numbers */}
        <div className="bg-gray-800 px-3 py-4 text-gray-400 text-sm font-mono select-none border-r border-gray-700">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6 text-right">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm leading-6 resize-none outline-none border-none"
            style={{
              tabSize: 2,
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />

          {/* Syntax Highlighting Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-words">
              <SyntaxHighlighter code={value} language={language} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple syntax highlighter component
function SyntaxHighlighter({ code, language }: { code: string; language: string }) {
  const highlightCode = (code: string, lang: string) => {
    // Simple regex-based syntax highlighting
    const keywords: Record<string, string[]> = {
      javascript: [
        "function",
        "const",
        "let",
        "var",
        "if",
        "else",
        "for",
        "while",
        "return",
        "class",
        "import",
        "export",
      ],
      typescript: [
        "function",
        "const",
        "let",
        "var",
        "if",
        "else",
        "for",
        "while",
        "return",
        "class",
        "import",
        "export",
        "interface",
        "type",
      ],
      python: ["def", "class", "if", "else", "elif", "for", "while", "return", "import", "from", "as", "try", "except"],
      java: ["public", "private", "class", "interface", "if", "else", "for", "while", "return", "import", "package"],
      cpp: ["#include", "using", "namespace", "class", "if", "else", "for", "while", "return", "int", "void", "auto"],
      c: ["#include", "int", "void", "if", "else", "for", "while", "return", "struct", "typedef"],
      go: ["package", "import", "func", "if", "else", "for", "return", "var", "const", "type", "struct"],
      rust: ["fn", "let", "mut", "if", "else", "for", "while", "return", "struct", "impl", "use", "mod"],
    }

    const langKeywords = keywords[lang] || keywords.javascript
    let highlighted = code

    // Highlight keywords
    langKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g")
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`)
    })

    // Highlight strings
    highlighted = highlighted.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-400">$1$2$1</span>')

    // Highlight comments
    if (lang === "python") {
      highlighted = highlighted.replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
    } else {
      highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>')
    }

    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-yellow-400">$1</span>')

    return highlighted
  }

  return (
    <div
      className="text-transparent"
      dangerouslySetInnerHTML={{
        __html: highlightCode(code, language),
      }}
    />
  )
}
