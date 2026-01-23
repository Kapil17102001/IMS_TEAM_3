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
    <Card className="p-3">
      <div >
       
        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
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
       {!resumeUrl ? (
          <Alert className="m-4 max-w-md bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              No resume found for this candidate. Download or upload a resume to
              proceed.
            </AlertDescription>
          </Alert>
        ) : (
          <iframe
            src={resumeUrl}
            title="Resume Viewer"
            style={{ width: "100%", height: "70vh", border: "none"}}
          />
        )}
      

      <p className="text-xs text-gray-500 mt-4">
        Resume preview. Use download button to get the full PDF file.
      </p>
    </Card>
  );
}
