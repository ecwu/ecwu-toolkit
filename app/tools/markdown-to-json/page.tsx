"use client";

import { useState, useRef } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw, Info } from "lucide-react";

interface ConversionResult {
  originalText: string;
  escapedText: string;
  length: number;
  lineCount: number;
}

export default function MarkdownToJsonPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const convertToJsonString = () => {
    if (!inputText.trim()) return;

    // Process JSON safe string (equivalent to Python logic)
    let escapedText = inputText;
    escapedText = escapedText.replace(/\\/g, "\\\\"); // First process backslashes
    escapedText = escapedText.replace(/\n/g, "\\n"); // Escape newlines
    escapedText = escapedText.replace(/"/g, '\\"'); // Escape double quotes

    setResult({
      originalText: inputText,
      escapedText: escapedText,
      length: inputText.length,
      lineCount: inputText.split('\n').length,
    });
  };

  const copyToClipboard = async () => {
    if (result?.escapedText) {
      try {
        await navigator.clipboard.writeText(result.escapedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const resetAll = () => {
    setInputText("");
    setResult(null);
    setCopied(false);
  };

  const copyAsJson = async () => {
    if (result?.escapedText) {
      try {
        const jsonFormat = `"${result.escapedText}"`;
        await navigator.clipboard.writeText(jsonFormat);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Text Tools", href: "#" },
          { title: "Markdown to JSON String", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Markdown to JSON String Converter</h1>
          <p className="text-muted-foreground">
            Convert multi-line markdown text to JSON-safe strings. Perfect for embedding
            text content in JSON files or APIs.
          </p>
        </div>

        {/* Adaptive Grid Layout */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 1. Input Component */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Text</label>
              <Textarea
                ref={textareaRef}
                placeholder="Paste your markdown text here to convert to JSON-safe string..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-40 font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={convertToJsonString} disabled={!inputText.trim()}>
                Convert to JSON String
              </Button>
              <Button variant="outline" onClick={resetAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {result && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md border">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  Conversion Complete
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  {result.lineCount} lines • {result.length} original characters
                </div>
              </div>
            )}
          </div>

          {/* 2. Output Component */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">JSON-Safe String</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAsJson}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy as JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <Textarea
                value={result.escapedText}
                readOnly
                className="min-h-40 bg-muted font-mono text-sm"
              />
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div className="font-medium mb-1">What was converted:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• <code>\</code> → <code>\\</code> (backslashes)</li>
                      <li>• <code>\n</code> → <code>\\n</code> (newlines)</li>
                      <li>• <code>&quot;</code> → <code>\\&quot;</code> (double quotes)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Preview Section */}
        {result && (
          <div className="space-y-2">
            <label className="text-sm font-medium">JSON Preview</label>
            <div className="p-4 bg-muted rounded-md font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">
{`{
  "title": "Your Text Content",
  "content": "${result.escapedText.slice(0, 200)}${result.escapedText.length > 200 ? '...' : ''}",
  "metadata": {
    "length": ${result.length},
    "lines": ${result.lineCount}
  }
}`}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              Preview shows first 200 characters of the escaped text
            </p>
          </div>
        )}
      </div>
    </>
  );
}