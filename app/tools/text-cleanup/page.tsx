"use client";

import { useState, useRef } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, RotateCcw, Info } from "lucide-react";

interface ProblemData {
  original?: string;
  replacement?: string;
  unicodeCode?: string;
  description?: string;
}

interface CleanupResult {
  cleanedText: string;
  highlightedText: Array<{
    text: string;
    isProblematic: boolean;
    type?: "replacement" | "removal";
    original?: string;
    replacement?: string;
    unicodeCode?: string;
    description?: string;
  }>;
}

export default function TextCleanupPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Unicode character replacements and descriptions
  const unicodeReplacements = [
    // Smart Quotes
    { from: "\u201c", to: '"', name: "Left Double Quotation Mark" },
    { from: "\u201d", to: '"', name: "Right Double Quotation Mark" },
    { from: "\u2018", to: "'", name: "Left Single Quotation Mark" },
    { from: "\u2019", to: "'", name: "Right Single Quotation Mark" },
    { from: "\u201a", to: "'", name: "Single Low-9 Quotation Mark" },
    { from: "\u201e", to: '"', name: "Double Low-9 Quotation Mark" },
    { from: "«", to: '"', name: "Left-Pointing Double Angle Quotation Mark" },
    { from: "»", to: '"', name: "Right-Pointing Double Angle Quotation Mark" },
    {
      from: "\u2039",
      to: "'",
      name: "Single Left-Pointing Angle Quotation Mark",
    },
    {
      from: "\u203a",
      to: "'",
      name: "Single Right-Pointing Angle Quotation Mark",
    },

    // Dashes & Hyphens
    { from: "\u2014", to: "-", name: "Em Dash" },
    { from: "\u2013", to: "-", name: "En Dash" },
    { from: "\u2010", to: "-", name: "Hyphen" },
    { from: "\u2011", to: "-", name: "Non-Breaking Hyphen" },
    { from: "\u2012", to: "-", name: "Figure Dash" },
    { from: "\u2015", to: "-", name: "Horizontal Bar" },

    // Invisible Spaces
    { from: "\u00a0", to: " ", name: "Non-Breaking Space" },
    { from: "\u2009", to: " ", name: "Thin Space" },
    { from: "\u200a", to: " ", name: "Hair Space" },
    { from: "\u2002", to: " ", name: "En Space" },
    { from: "\u2003", to: " ", name: "Em Space" },
    { from: "\u202f", to: " ", name: "Narrow No-Break Space" },
    { from: "\u2028", to: "\n", name: "Line Separator" },
    { from: "\u2029", to: "\n\n", name: "Paragraph Separator" },
    { from: "\u3000", to: " ", name: "Ideographic Space" },
    { from: "\u180e", to: " ", name: "Mongolian Vowel Separator" },
    { from: "\u200b", to: "", name: "Zero Width Space" },
    { from: "\u200c", to: "", name: "Zero Width Non-Joiner" },
    { from: "\u200d", to: "", name: "Zero Width Joiner" },
    { from: "\ufeff", to: "", name: "Zero Width No-Break Space (BOM)" },

    // Special Punctuation
    { from: "\u2026", to: "...", name: "Horizontal Ellipsis" },
    { from: "\u2022", to: "- ", name: "Bullet Point" },
  ];

  const getUnicodeInfo = (char: string) => {
    const code = char.charCodeAt(0);
    return {
      unicodeCode: `U+${code.toString(16).toUpperCase().padStart(4, "0")}`,
      description: `Unicode character (${code})`,
    };
  };

  const cleanText = () => {
    if (!inputText.trim()) return;

    let cleanedText = inputText;
    const highlightedText: CleanupResult["highlightedText"] = [];

    // Create a map for quick lookup of replacement characters
    const replacementMap = new Map<string, { to: string; name: string }>();
    unicodeReplacements.forEach(({ from, to, name }) => {
      replacementMap.set(from, { to, name });
    });

    // Define allowed characters pattern for removal detection
    const allowedPattern =
      /[A-Za-z0-9\s.,;:!?"'()\[\]{}<>@#%^&*\-+=_/\\|~`àâäçéèêëîïôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆáíóúñüÁÍÓÚÑÜ¿¡\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;

    // Process each character and build highlighted text
    const chars = inputText.split("");
    let currentSegment = "";
    let isCurrentSegmentProblematic = false;
    let currentProblemType: "replacement" | "removal" | undefined;
    let currentProblemData: ProblemData = {};

    const flushSegment = () => {
      if (currentSegment) {
        highlightedText.push({
          text: currentSegment,
          isProblematic: isCurrentSegmentProblematic,
          type: currentProblemType,
          ...currentProblemData,
        });
        currentSegment = "";
        isCurrentSegmentProblematic = false;
        currentProblemType = undefined;
        currentProblemData = {};
      }
    };

    chars.forEach((char) => {
      const replacement = replacementMap.get(char);
      const isAllowed = allowedPattern.test(char);
      let isProblematic = false;
      let problemType: "replacement" | "removal" | undefined;
      let problemData: ProblemData = {};

      if (replacement) {
        // Character will be replaced
        isProblematic = true;
        problemType = "replacement";
        const unicodeInfo = getUnicodeInfo(char);
        problemData = {
          original: char,
          replacement: replacement.to,
          unicodeCode: unicodeInfo.unicodeCode,
          description: replacement.name,
        };
      } else if (!isAllowed) {
        // Character will be removed
        isProblematic = true;
        problemType = "removal";
        const unicodeInfo = getUnicodeInfo(char);
        problemData = {
          original: char,
          unicodeCode: unicodeInfo.unicodeCode,
          description: unicodeInfo.description,
        };
      }

      // Check if we need to start a new segment
      if (
        isProblematic !== isCurrentSegmentProblematic ||
        problemType !== currentProblemType ||
        (isProblematic &&
          JSON.stringify(problemData) !== JSON.stringify(currentProblemData))
      ) {
        flushSegment();
        isCurrentSegmentProblematic = isProblematic;
        currentProblemType = problemType;
        currentProblemData = problemData;
      }

      currentSegment += char;
    });

    // Flush the final segment
    flushSegment();

    // Apply character replacements
    unicodeReplacements.forEach(({ from, to }) => {
      cleanedText = cleanedText.replace(new RegExp(from, "g"), to);
    });

    // Strip leading/trailing whitespace
    cleanedText = cleanedText.trim();

    // Remove disallowed characters
    cleanedText = cleanedText.replace(
      /[^A-Za-z0-9\s.,;:!?"'()\[\]{}<>@#%^&*\-+=_/\\|~`àâäçéèêëîïôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆáíóúñüÁÍÓÚÑÜ¿¡\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu,
      ""
    );

    // Clean up excessive spaces
    cleanedText = cleanedText.replace(/\s+\n/g, "\n"); // Remove spaces before newlines
    cleanedText = cleanedText.replace(/[ \t]+/g, " "); // Normalize multiple spaces/tabs but preserve newlines

    setResult({
      cleanedText,
      highlightedText,
    });
  };

  const copyToClipboard = async () => {
    if (result?.cleanedText) {
      try {
        await navigator.clipboard.writeText(result.cleanedText);
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

  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Utilities", href: "#" },
          { title: "Text Cleanup", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">LLM Text Cleanup</h1>
          <p className="text-muted-foreground">
            Remove hidden Unicode characters, normalize special characters, and
            clean up text from LLM outputs. Perfect for cleaning up copied text
            with invisible formatting characters.
          </p>
        </div>

        {/* Adaptive Grid Layout */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* 1. Input Component */}
          <div className="space-y-4 lg:col-span-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Text</label>
              <Textarea
                ref={textareaRef}
                placeholder="Paste your text here to clean up hidden Unicode characters..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-32"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={cleanText} disabled={!inputText.trim()}>
                Clean Text
              </Button>
              <Button variant="outline" onClick={resetAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {result && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Analysis Complete
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  Found{" "}
                  {result.highlightedText
                    .filter((segment) => segment.isProblematic)
                    .reduce(
                      (sum, segment) => sum + segment.text.length,
                      0
                    )}{" "}
                  problem characters
                </div>
              </div>
            )}
          </div>

          {/* 2. Detail with Highlights Component */}
          {result &&
            result.highlightedText &&
            result.highlightedText.length > 0 && (
              <div className="space-y-2 lg:col-span-1">
                <label className="text-sm font-medium">
                  Original Text with Highlights
                </label>
                <div className="p-3 border rounded-md bg-muted/50 min-h-32 font-mono text-sm whitespace-pre-wrap break-words">
                  {result.highlightedText.map((segment, index) => {
                    if (!segment.isProblematic) {
                      return <span key={index}>{segment.text}</span>;
                    }

                    const displayText =
                      segment.text === " " ? "␣" : segment.text;
                    const isReplacement = segment.type === "replacement";

                    return (
                      <Popover key={index}>
                        <PopoverTrigger asChild>
                          <span
                            className={`relative inline-block px-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                              isReplacement
                                ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-400"
                                : "bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 border border-red-400"
                            }`}
                          >
                            {displayText}
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="top">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">
                                  {isReplacement
                                    ? "Character Replacement"
                                    : "Character Removal"}
                                </h4>

                                <div className="space-y-1 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Problem:
                                    </span>{" "}
                                    {segment.description}
                                  </div>

                                  <div>
                                    <span className="text-muted-foreground">
                                      Unicode:
                                    </span>{" "}
                                    {segment.unicodeCode}
                                  </div>

                                  <div>
                                    <span className="text-muted-foreground">
                                      Original character:
                                    </span>{" "}
                                    <code className="bg-muted px-1 rounded text-xs">
                                      {segment.original === " "
                                        ? "␣ (space)"
                                        : `"${segment.original}"`}
                                    </code>
                                  </div>

                                  {isReplacement && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Will be replaced with:
                                      </span>{" "}
                                      <code className="bg-muted px-1 rounded text-xs">
                                        {segment.replacement === " "
                                          ? "␣ (space)"
                                          : `"${segment.replacement}"`}
                                      </code>
                                    </div>
                                  )}

                                  {!isReplacement && (
                                    <div className="text-red-600 dark:text-red-400">
                                      <span className="text-muted-foreground">
                                        Action:
                                      </span>{" "}
                                      This character will be removed
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-yellow-200 dark:bg-yellow-800 border border-yellow-400 rounded"></span>
                      Yellow = Replaced
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-200 dark:bg-red-800 border border-red-400 rounded"></span>
                      Red = Removed
                    </span>
                  </div>
                  <div className="mt-1">
                    Click highlighted characters for details
                  </div>
                </div>
              </div>
            )}

          {/* 3. Clean Text Preview and Copy Component */}
          {result && (
            <div className="space-y-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Clean Text</label>
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
              <Textarea
                value={result.cleanedText}
                readOnly
                className="min-h-32 bg-muted"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
