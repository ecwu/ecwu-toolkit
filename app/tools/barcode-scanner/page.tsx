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
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Copy, ExternalLink, AlertCircle, Scan } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

interface ScanResult {
  text: string;
  format: string;
  timestamp: Date;
}

export default function BarcodeScannerPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState("");
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    checkCameras();
    codeReaderRef.current = new BrowserMultiFormatReader();
    
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const checkCameras = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setHasCamera(videoDevices.length > 0);
      setCameras(videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error checking cameras:", error);
      setHasCamera(false);
      setError("Unable to access camera permissions.");
    }
  };

  const startScanning = async () => {
    if (!videoRef.current || !codeReaderRef.current) return;

    try {
      setError("");
      setIsScanning(true);

      await codeReaderRef.current.decodeFromVideoDevice(
        selectedCamera || undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scanResult: ScanResult = {
              text: result.getText(),
              format: result.getBarcodeFormat().toString(),
              timestamp: new Date(),
            };

            setResult(scanResult);

            // Add to history if not already present
            setScanHistory(prev => {
              const exists = prev.some(item => 
                item.text === scanResult.text && item.format === scanResult.format
              );
              if (!exists) {
                return [scanResult, ...prev.slice(0, 9)]; // Keep last 10 scans
              }
              return prev;
            });

            // Only stop scanning if not in continuous mode
            if (!continuousMode) {
              stopScanning();
            }
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error("Scanning error:", error);
          }
        }
      );
    } catch (error) {
      console.error("Error starting scanner:", error);
      setError("Unable to start camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  const scanFile = async (file: File) => {
    if (!codeReaderRef.current) return;

    try {
      setError("");
      const result = await codeReaderRef.current.decodeFromFile(file);
      
      const scanResult: ScanResult = {
        text: result.getText(),
        format: result.getBarcodeFormat().toString(),
        timestamp: new Date(),
      };

      setResult(scanResult);
      
      // Add to history
      setScanHistory(prev => {
        const exists = prev.some(item => 
          item.text === scanResult.text && item.format === scanResult.format
        );
        if (!exists) {
          return [scanResult, ...prev.slice(0, 9)];
        }
        return prev;
      });
    } catch (error) {
      console.error("Error scanning file:", error);
      setError("No barcode found in the uploaded image.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      scanFile(file);
    }
  };

  const copyResult = async () => {
    if (result?.text) {
      await navigator.clipboard.writeText(result.text);
    }
  };

  const openUrl = () => {
    if (result?.text && (result.text.startsWith("http://") || result.text.startsWith("https://"))) {
      window.open(result.text, "_blank");
    }
  };

  const formatBarcodeType = (format: string) => {
    const formatMap: Record<string, string> = {
      'CODE_128': 'Code 128',
      'CODE_39': 'Code 39',
      'CODE_93': 'Code 93',
      'CODABAR': 'Codabar',
      'EAN_13': 'EAN-13',
      'EAN_8': 'EAN-8',
      'UPC_A': 'UPC-A',
      'UPC_E': 'UPC-E',
      'ITF': 'ITF',
      'RSS_14': 'RSS-14',
      'RSS_EXPANDED': 'RSS Expanded',
      'DATA_MATRIX': 'Data Matrix',
      'PDF_417': 'PDF417',
      'AZTEC': 'Aztec',
      'QR_CODE': 'QR Code'
    };
    return formatMap[format] || format;
  };

  const isUrl = result?.text && (result.text.startsWith("http://") || result.text.startsWith("https://"));

  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Generators", href: "#" },
          { title: "Barcode Scanner", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Barcode Scanner</h1>
          <p className="text-muted-foreground">
            Scan various barcode formats including UPC, EAN, Code 128, Code 39, and more using your camera or upload an image file.
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
                        <SelectItem key={camera.deviceId} value={camera.deviceId}>
                          {camera.label || `Camera ${camera.deviceId}`}
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
                          <Scan className="w-12 h-12 mx-auto mb-2 opacity-50" />
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
                  Camera access is not available. You can still upload image files to scan barcodes.
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
              <div className="flex items-center gap-2">
                <Label>Scan Result</Label>
                {result && (
                  <Badge variant="secondary">
                    {formatBarcodeType(result.format)}
                  </Badge>
                )}
              </div>
              <Textarea
                value={result?.text || ""}
                readOnly
                placeholder="Scanned barcode content will appear here..."
                rows={6}
              />
              {result && (
                <div className="text-xs text-muted-foreground">
                  Scanned at {result.timestamp.toLocaleString()}
                </div>
              )}
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
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {formatBarcodeType(scan.format)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {scan.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="truncate">
                        {scan.text.length > 40 ? `${scan.text.substring(0, 40)}...` : scan.text}
                      </div>
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