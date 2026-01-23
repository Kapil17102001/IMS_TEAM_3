import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ZoomIn, ZoomOut, Download, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResumeViewerProps {
  resumeUrl?: string;
}

export default function ResumeViewer({ resumeUrl }: ResumeViewerProps) {
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState(false);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleDownload = () => {
    if (resumeUrl) {
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Resume</h3>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="gap-2"
          >
            <ZoomOut className="h-4 w-4" />
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 2}
            className="gap-2"
          >
            <ZoomIn className="h-4 w-4" />
            Zoom In
          </Button>
          <span className="text-sm text-gray-600 flex items-center px-2">
            {Math.round(scale * 100)}%
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!resumeUrl}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            disabled={!resumeUrl}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
        </div>
      </div>

      {/* Resume Display Area */}
      <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 min-h-96 flex items-center justify-center">
        {!resumeUrl ? (
          <Alert className="m-4 max-w-md bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              No resume found for this candidate. Download or upload a resume to
              proceed.
            </AlertDescription>
          </Alert>
        ) : loadError ? (
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              Failed to load resume
            </p>
            <p className="text-gray-600 text-sm mb-4">
              The resume could not be displayed. Try downloading it instead.
            </p>
            <Button onClick={handleDownload}>Download Resume</Button>
          </div>
        ) : (
          <div className="w-full h-96 overflow-auto bg-white flex items-center justify-center">
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                transition: "transform 200ms ease-out",
              }}
              className="w-full"
            >
              {/* PDF Preview Placeholder */}
              {/* In a real app, you would use a PDF viewer library like react-pdf or pdfjs-dist */}
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 min-h-96">
                <div className="bg-white rounded p-6 shadow-sm">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    <div className="border-t pt-3 mt-3">
                      <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-50 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Resume preview. Use download button to get the full PDF file.
      </p>
    </Card>
  );
}
