import { Brain, TrendingDown, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MLPredictionProps {
  tirePressures: number[];
  load: number;
  speed: number;
  temperature: number;
}

export function MLPrediction({ tirePressures, load, speed, temperature }: MLPredictionProps) {
  // Simple ML-like calculation for tire life
  const avgPressure = tirePressures.reduce((a, b) => a + b, 0) / tirePressures.length;
  
  // Factors affecting tire life
  const pressureFactor = avgPressure >= 35 && avgPressure <= 40 ? 1 : 0.7;
  const loadFactor = load > 25 ? 0.6 : load > 20 ? 0.8 : 1;
  const speedFactor = speed > 80 ? 0.7 : 1;
  const tempFactor = temperature > 85 ? 0.6 : 1;
  
  const tireLife = Math.round(
    100 * pressureFactor * loadFactor * speedFactor * tempFactor
  );

  const getTrend = () => {
    if (tireLife >= 80) return { icon: TrendingUp, text: 'Excellent', class: 'status-good' };
    if (tireLife >= 60) return { icon: TrendingUp, text: 'Good', class: 'text-primary' };
    if (tireLife >= 40) return { icon: TrendingDown, text: 'Fair', class: 'status-warning' };
    return { icon: TrendingDown, text: 'Poor', class: 'status-critical' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  const getRecommendations = () => {
    const recommendations: string[] = [];
    
    if (avgPressure < 35) recommendations.push('Increase tire pressure to 35-40 PSI');
    if (avgPressure > 40) recommendations.push('Reduce tire pressure to 35-40 PSI');
    if (load > 25) recommendations.push('High load detected - reduce to extend tire life');
    if (speed > 80) recommendations.push('High speed reduces tire lifespan - moderate speed recommended');
    if (temperature > 85) recommendations.push('High temperature - check cooling system');
    
    if (recommendations.length === 0) {
      recommendations.push('All parameters optimal - maintain current conditions');
    }
    
    return recommendations;
  };

  return (
    <div className="glass-panel p-6 space-y-6 animate-slide-up">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2 glow-primary">
          <Brain className="h-5 w-5" />
          ML Tire Life Prediction
        </h2>
      </div>

      {/* Main prediction */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Predicted Tire Health</span>
          <div className="flex items-center gap-2">
            <TrendIcon className={`h-4 w-4 ${trend.class}`} />
            <span className={`font-bold ${trend.class}`}>{tireLife}%</span>
          </div>
        </div>

        <Progress value={tireLife} className="h-3" />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Condition:</span>
          <span className={`font-semibold ${trend.class}`}>{trend.text}</span>
        </div>
      </div>

      {/* Factors breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Impact Factors</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Pressure</div>
            <div className={`font-bold ${pressureFactor === 1 ? 'status-good' : 'status-warning'}`}>
              {Math.round(pressureFactor * 100)}%
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Load</div>
            <div className={`font-bold ${loadFactor === 1 ? 'status-good' : 'status-warning'}`}>
              {Math.round(loadFactor * 100)}%
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Speed</div>
            <div className={`font-bold ${speedFactor === 1 ? 'status-good' : 'status-warning'}`}>
              {Math.round(speedFactor * 100)}%
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Temperature</div>
            <div className={`font-bold ${tempFactor === 1 ? 'status-good' : 'status-warning'}`}>
              {Math.round(tempFactor * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
        <div className="space-y-2">
          {getRecommendations().map((rec, index) => (
            <div 
              key={index} 
              className="text-xs bg-primary/10 border border-primary/30 p-3 rounded-lg text-foreground"
            >
              • {rec}
            </div>
          ))}
        </div>
      </div>

      {/* Estimated life remaining */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 rounded-lg border border-primary/30">
        <div className="text-xs text-muted-foreground mb-1">Estimated Remaining Life</div>
        <div className="text-2xl font-bold text-primary">
          {Math.round((tireLife / 100) * 50000)} km
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Based on current operating conditions
        </div>
      </div>
    </div>
  );
}
