import { Bot, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIAssistantProps {
  tirePressures: number[];
  fuelLevel: number;
  temperature: number;
  load: number;
  speed: number;
  engineOn: boolean;
}

export function AIAssistant({
  tirePressures,
  fuelLevel,
  temperature,
  load,
  speed,
  engineOn,
}: AIAssistantProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState('');

  useEffect(() => {
    const getSuggestion = () => {
      const suggestions: string[] = [];

      // Critical checks first
      if (fuelLevel < 20) {
        suggestions.push('⚠️ Fuel critically low! Plan immediate refueling to avoid breakdown.');
      }
      if (temperature > 95) {
        suggestions.push('🔥 Engine overheating! Stop and check cooling system immediately.');
      }
      if (tirePressures.some(p => p < 30)) {
        suggestions.push('⚠️ Critical tire pressure detected! Stop and inflate tires to prevent blowout.');
      }

      // Warnings
      if (load > 25 && speed > 80) {
        suggestions.push('⚡ Heavy load + high speed reduces efficiency. Consider slowing down.');
      }
      if (fuelLevel < 40) {
        suggestions.push('⛽ Fuel dropping fast. Check for leakage or plan next fuel stop.');
      }
      if (temperature > 85 && speed > 90) {
        suggestions.push('🌡️ High temp at high speed. Reduce speed to cool engine.');
      }

      // Optimization tips
      const avgPressure = tirePressures.reduce((a, b) => a + b, 0) / tirePressures.length;
      if (avgPressure >= 35 && avgPressure <= 40 && temperature < 85 && load < 25) {
        suggestions.push('✅ Optimal conditions! Maintain current parameters for best efficiency.');
      }

      if (engineOn && speed === 0) {
        suggestions.push('💡 Engine idling. Turn off to save fuel if stationary for long.');
      }

      if (!engineOn) {
        suggestions.push('🔌 Engine off. All systems ready. Start engine to begin monitoring.');
      }

      return suggestions.length > 0 ? suggestions[0] : '📊 Monitoring all systems...';
    };

    setCurrentSuggestion(getSuggestion());

    const interval = setInterval(() => {
      setCurrentSuggestion(getSuggestion());
    }, 5000);

    return () => clearInterval(interval);
  }, [tirePressures, fuelLevel, temperature, load, speed, engineOn]);

  return (
    <div className="glass-panel p-4 animate-slide-up glow-primary">
      <div className="flex items-start gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Bot className="h-5 w-5 text-primary animate-pulse-glow" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">TechnoEdge AI Assistant</span>
            <Sparkles className="h-3 w-3 text-secondary" />
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {currentSuggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
