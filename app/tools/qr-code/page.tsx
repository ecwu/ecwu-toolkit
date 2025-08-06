"use client";

import { useState, useRef } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Copy } from "lucide-react";
import QRCode from "qrcode";

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [size, setSize] = useState("200");
  const [errorCorrection, setErrorCorrection] = useState("M");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (!text.trim()) return;

    try {
      const options = {
        width: parseInt(size),
        errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      };

      const url = await QRCode.toDataURL(text, options);
      setQrCodeUrl(url);

      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, text, options);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCodeUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Generators", href: "#" },
          { title: "QR Code Generator", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground">
            Generate QR codes from text, URLs, or any string data with
            customizable options.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text or URL</Label>
              <Textarea
                id="text"
                placeholder="Enter text, URL, or data to encode..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (px)</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100px</SelectItem>
                    <SelectItem value="150">150px</SelectItem>
                    <SelectItem value="200">200px</SelectItem>
                    <SelectItem value="300">300px</SelectItem>
                    <SelectItem value="400">400px</SelectItem>
                    <SelectItem value="500">500px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="errorCorrection">Error Correction</Label>
                <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateQRCode} className="w-full" disabled={!text.trim()}>
              Generate QR Code
            </Button>
          </div>

          <div className="space-y-4">
            {qrCodeUrl && (
              <>
                <div className="space-y-2">
                  <Label>Generated QR Code</Label>
                  <div className="flex justify-center p-4 border rounded-lg bg-white">
                    <img
                      src={qrCodeUrl}
                      alt="Generated QR Code"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Image
                  </Button>
                </div>
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </>
  );
}