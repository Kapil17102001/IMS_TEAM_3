import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Interns() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Intern Views</h1>
          <p className="text-muted-foreground">
            Detailed profiles and information about each intern
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Coming Soon
            </h2>
            <p className="text-muted-foreground max-w-md">
              The Intern Views page is not yet implemented. This page will display
              detailed profiles for each intern with their skills, performance history,
              and assigned tasks.
            </p>
            <Button variant="outline" className="mt-4">
              Continue with the next page
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
