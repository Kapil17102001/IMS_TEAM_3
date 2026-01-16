import { Link } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <Card className="p-12 text-center">
          <div className="text-6xl font-bold text-primary mb-4">404</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <button className="text-primary hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
