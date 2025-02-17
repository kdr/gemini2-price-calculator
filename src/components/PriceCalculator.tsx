import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calculator } from "lucide-react";

type ModelType = "gemini-2-flash" | "gemini-2-flash-lite" | "gemini-1-5-flash" | "gemini-1-5-pro";
type InputType = "text" | "image" | "video" | "audio" | "output" | "training";

interface PriceData {
  [key: string]: {
    regular: { [key in InputType]?: number };
    batch: { [key in InputType]?: number };
  };
}

const PRICE_DATA: PriceData = {
  "gemini-2-flash": {
    regular: {
      text: 0.0375,
      image: 0.0001935,
      video: 0.0000387,
      audio: 0.000025,
      output: 0.15,
    },
    batch: {
      text: 0.01875,
      image: 0.0000968,
      video: 0.0000194,
      audio: 0.0000125,
      output: 0.075,
    },
  },
  "gemini-2-flash-lite": {
    regular: {
      text: 0.01875,
      image: 0.0000968,
      video: 0.0000194,
      audio: 0.0000019,
      output: 0.075,
    },
    batch: {
      text: 0.009375,
      image: 0.0000484,
      video: 0.0000097,
      audio: 0.0000009,
      output: 0.0375,
    },
  },
  "gemini-1-5-flash": {
    regular: {
      text: 0.0000188,
      image: 0.00002,
      video: 0.00002,
      audio: 0.000002,
      output: 0.000075,
      training: 8,
    },
    batch: {
      text: 0.0000375,
      image: 0.00004,
      video: 0.00004,
      audio: 0.000004,
      output: 0.00015,
      training: 16,
    },
  },
  "gemini-1-5-pro": {
    regular: {
      text: 0.0003125,
      image: 0.00032875,
      video: 0.00032875,
      audio: 0.0000313,
      output: 0.00125,
      training: 80,
    },
    batch: {
      text: 0.000625,
      image: 0.0006575,
      video: 0.0006575,
      audio: 0.0000625,
      output: 0.0025,
      training: 160,
    },
  },
};

const PriceCalculator = () => {
  const [selectedModel, setSelectedModel] = useState<ModelType>("gemini-2-flash");
  const [useBatchAPI, setUseBatchAPI] = useState(false);
  const [numberOfRequests, setNumberOfRequests] = useState(1);
  const [inputs, setInputs] = useState({
    text: 0,
    image: 0,
    video: 0,
    audio: 0,
    output: 0,
    training: 0,
  });
  const [units, setUnits] = useState({
    text: "K",
    image: "units",
    video: "units",
    audio: "units",
    output: "K",
    training: "M",
  });
  const [totalCost, setTotalCost] = useState(0);

  const isGemini15Model = selectedModel.includes("1-5");
  const isGemini20Model = selectedModel.includes("2-flash");

  useEffect(() => {
    if (isGemini15Model) {
      setUseBatchAPI(false);
    }
  }, [selectedModel, isGemini15Model]);

  const getUnitMultiplier = (unit: string, type: InputType) => {
    if (type === "text" || type === "output") {
      switch (unit) {
        case "M":
          return 1;
        case "K":
          return 0.001;
        default:
          return 0.000001;
      }
    } else {
      switch (unit) {
        case "M":
          return 1000000;
        case "K":
          return 1000;
        default:
          return 1;
      }
    }
  };

  useEffect(() => {
    const prices = useBatchAPI ? PRICE_DATA[selectedModel].batch : PRICE_DATA[selectedModel].regular;
    let cost = 0;

    Object.entries(inputs).forEach(([type, value]) => {
      if (prices[type as InputType] && value) {
        const multiplier = getUnitMultiplier(units[type as InputType], type as InputType);
        cost += (value * multiplier) * (prices[type as InputType] || 0);
      }
    });

    cost *= numberOfRequests;
    setTotalCost(cost);
  }, [selectedModel, inputs, useBatchAPI, units, numberOfRequests]);

  const handleInputChange = (type: InputType, value: string) => {
    setInputs(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0,
    }));
  };

  const handleUnitChange = (type: InputType, value: string) => {
    setUnits(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const renderInput = (type: InputType, label: string, showUnits = true) => {
    if (!PRICE_DATA[selectedModel].regular[type]) return null;

    const isTextType = type === "text" || type === "output";
    const pricePerUnit = useBatchAPI ? PRICE_DATA[selectedModel].batch[type] : PRICE_DATA[selectedModel].regular[type];
    const isGemini20Model = selectedModel.includes("2-flash");
    
    let unitDescription = "";
    if (isTextType) {
      unitDescription = "1M characters";
    } else if (type === "training") {
      unitDescription = "M tokens";
    } else if (type === "video" || type === "audio") {
      unitDescription = "second";
    } else {
      unitDescription = "unit";
    }

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={inputs[type] || ""}
            onChange={(e) => handleInputChange(type, e.target.value)}
            className="flex-1"
          />
          {showUnits && (
            <Select
              value={units[type]}
              onValueChange={(value) => handleUnitChange(type, value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="units">Units</SelectItem>
                <SelectItem value="K">K</SelectItem>
                <SelectItem value="M">M</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="text-sm text-gray-500">
          ${pricePerUnit} per {unitDescription}
          {isGemini20Model && type === "video" && (
            <div className="mt-1 text-amber-600">
              Note: If video contains audio, you will be billed for audio processing as well
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label>Select Model</Label>
          <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as ModelType)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2-flash">Gemini 2.0 Flash</SelectItem>
              <SelectItem value="gemini-2-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
              <SelectItem value="gemini-1-5-flash">Gemini 1.5 Flash</SelectItem>
              <SelectItem value="gemini-1-5-pro">Gemini 1.5 Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!isGemini15Model && (
          <div className="flex items-center space-x-2">
            <Label>Use Batch API</Label>
            <Switch
              checked={useBatchAPI}
              onCheckedChange={setUseBatchAPI}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Number of Requests</Label>
        <Input
          type="number"
          min="1"
          step="1"
          value={numberOfRequests}
          onChange={(e) => setNumberOfRequests(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full md:w-[200px]"
        />
        <div className="text-sm text-gray-500">
          Total cost will be multiplied by the number of requests
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput("text", "Input Text")}
        {renderInput("image", "Input Images", false)}
        {renderInput("video", "Input Video (seconds)", false)}
        {renderInput("audio", "Input Audio (seconds)", false)}
        {renderInput("output", "Output Text")}
        {renderInput("training", "Training Tokens")}
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Total Estimated Cost:</span>
        </div>
        <div className="text-xl font-bold">${totalCost.toFixed(6)}</div>
      </div>
    </div>
  );
};

export default PriceCalculator;
