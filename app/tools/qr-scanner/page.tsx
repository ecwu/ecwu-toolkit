"use client";

import { useState, useRef, useEffect } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Copy, ExternalLink, AlertCircle } from "lucide-react";
import QrScanner from "qr-scanner";

export default function QRScannerPage() {
  const [result, setResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);
  const [error, setError] = useState("");
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    checkCameras();
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const checkCameras = async () => {
    try {
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);

      if (hasCamera) {
        const cameras = await QrScanner.listCameras(true);
        setCameras(cameras);
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].id);
        }
      }
    } catch (error) {
      console.error("Error checking cameras:", error);
      setError("Unable to access camera permissions.");
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError("");
      setIsScanning(true);

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          const scannedData = result.data;
          setResult(scannedData);
          
          // Add to history if not already present
          setScanHistory(prev => {
            if (!prev.includes(scannedData)) {
              return [scannedData, ...prev.slice(0, 9)]; // Keep last 10 scans
            }
            return prev;
          });

          // Only stop scanning if not in continuous mode
          if (!continuousMode) {
            stopScanning();
          }
        },
        {
          preferredCamera: selectedCamera || "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error("Error starting scanner:", error);
      setError("Unable to start camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const scanFile = async (file: File) => {
    try {
      setError("");
      const result = await QrScanner.scanImage(file);
      setResult(result);
    } catch (error) {
      console.error("Error scanning file:", error);
      setError("No QR code found in the uploaded image.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      scanFile(file);
    }
  };

  const copyResult = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
    }
  };

  const openUrl = () => {
    if (result && (result.startsWith("http://") || result.startsWith("https://"))) {
      window.open(result, "_blank");
    }
  };

  const isUrl = result.startsWith("http://") || result.startsWith("https://");

  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Generators", href: "#" },
          { title: "QR Code Scanner", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">QR Code Scanner</h1>
          <p className="text-muted-foreground">
            Scan QR codes using your camera or upload an image file to extract
            the encoded data.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {hasCamera && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="camera">Camera</Label>
                  <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {cameras.map((camera) => (
                        <SelectItem key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${camera.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Camera Scanner</Label>
                  <div className="relative border rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      style={{ display: isScanning ? "block" : "none" }}
                    />
                    {!isScanning && (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <div className="text-center">
                          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Camera preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="continuous-mode"
                      checked={continuousMode}
                      onCheckedChange={setContinuousMode}
                    />
                    <Label htmlFor="continuous-mode">Continuous scanning</Label>
                  </div>

                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button onClick={startScanning} className="flex-1">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Scanning
                      </Button>
                    ) : (
                      <Button onClick={stopScanning} variant="destructive" className="flex-1">
                        Stop Scanning
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {!hasCamera && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Camera access is not available. You can still upload image files to scan QR codes.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Upload Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image File
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Scan Result</Label>
              <Textarea
                value={result}
                readOnly
                placeholder="Scanned QR code content will appear here..."
                rows={8}
              />
            </div>

            {result && (
              <div className="flex gap-2">
                <Button onClick={copyResult} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                {isUrl && (
                  <Button onClick={openUrl} variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open URL
                  </Button>
                )}
              </div>
            )}

            {scanHistory.length > 0 && (
              <div className="space-y-2">
                <Label>Scan History</Label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className="p-2 text-sm border rounded cursor-pointer hover:bg-accent"
                      onClick={() => setResult(scan)}
                    >
                      {scan.length > 50 ? `${scan.substring(0, 50)}...` : scan}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScanHistory([])}
                  className="w-full"
                >
                  Clear History
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}