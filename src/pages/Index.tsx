
import { Card } from "@/components/ui/card";
import PriceCalculator from "@/components/PriceCalculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Vertex AI Gemini Price Calculator</h1>
            <p className="text-gray-500">Calculate costs for different Gemini models and input types</p>
          </div>
          <Card className="p-6">
            <PriceCalculator />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
