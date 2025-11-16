"use client";

import { useState } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ArrowUpDown } from "lucide-react";

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const processText = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch {
      setOutput("Error: Invalid input for decoding");
    }
  };

  const swapMode = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Text Tools", href: "#" },
          { title: "Base64 Encoder/Decoder", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Base64 Encoder/Decoder</h1>
          <p className="text-muted-foreground">
            Encode text to Base64 or decode Base64 back to text. Base64 encoding is commonly used for data transmission and storage.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {mode === "encode" ? "Text Input" : "Base64 Input"}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapMode}
                  className="gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Switch to {mode === "encode" ? "Decode" : "Encode"}
                </Button>
              </div>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Enter Base64 to decode..."
              }
              className="min-h-32 font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {mode === "encode" ? "Base64 Output" : "Text Output"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(output)}
                disabled={!output}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder={
                mode === "encode"
                  ? "Base64 encoded output will appear here..."
                  : "Decoded text will appear here..."
              }
              className="min-h-32 font-mono bg-muted"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={processText} disabled={!input} className="gap-2">
            {mode === "encode" ? "Encode" : "Decode"}
          </Button>
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>

        {output && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium">Information</h3>
                <div className="grid gap-2 text-sm text-muted-foreground lg:grid-cols-3">
                  <div>
                    Input length: {input.length} characters
                  </div>
                  <div>
                    Output length: {output.length} characters
                  </div>
                  <div>
                    {mode === "encode" 
                      ? `Size increase: ${((output.length / input.length - 1) * 100).toFixed(1)}%`
                      : `Size decrease: ${((1 - output.length / input.length) * 100).toFixed(1)}%`
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}