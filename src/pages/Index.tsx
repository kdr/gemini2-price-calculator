
import { Card } from "@/components/ui/card";
import PriceCalculator from "@/components/PriceCalculator";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this URL to show these exact calculator settings",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Vertex AI Gemini Price Calculator</h1>
            <p className="text-gray-500">Calculate costs for different Gemini models and input types</p>
          </div>
          <Card className="p-6">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleShareClick}
              >
                <Link2 className="h-4 w-4" />
                Share Calculator Settings
              </Button>
            </div>
            <PriceCalculator />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
