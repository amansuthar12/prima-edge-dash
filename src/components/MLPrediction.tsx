import { Brain, TrendingDown, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MLPredictionProps {
  tirePressures: number[];
  load: number;
  speed: number;
  temperature: number;
}

export function MLPrediction({ tirePressures, load, speed, temperature }: MLPredictionProps) {
  const avgPressure = tirePressures.reduce((a, b) => a + b, 0) / tirePressures.length;

  // === Ideal operating conditions ===
  const idealPressure = 37.5; // psi
  const idealTempRange = [60, 75]; // °C
  const maxSafeLoad = 25; // tons
  const maxSafeSpeed = 80; // km/h

  // === PRESSURE FACTOR (bell-curve: best near idealPressure) ===
  const pressureDiff = Math.abs(avgPressure - idealPressure);
  const pressureFactor = Math.max(0, 1 - (pressureDiff / 10) ** 2); // parabolic drop-off

  // === LOAD FACTOR (inverse proportional) ===
  // beyond 25 tons, health drops sharply
  const loadFactor = Math.max(0, 1 - Math.pow(load / maxSafeLoad, 1.3));

  // === SPEED FACTOR (inverse beyond 60 km/h) ===
  let speedFactor = 1;
  if (speed > 40) {
    speedFactor = Math.max(0.3, 1 - Math.pow((speed - 40) / (maxSafeSpeed - 40), 1.2));
  }

  // === TEMPERATURE FACTOR (optimal between 60–75°C) ===
  let tempFactor;
  if (temperature >= idealTempRange[0] && temperature <= idealTempRange[1]) {
    tempFactor = 1; // perfect
  } else {
    const deviation =
      temperature < idealTempRange[0]
        ? idealTempRange[0] - temperature
        : temperature - idealTempRange[1];
    tempFactor = Math.max(0, 1 - (deviation / 40) ** 2);
  }

  // === COMBINED REALISTIC SCORE ===
  const weightedScore =
    0.4 * pressureFactor +
    0.25 * loadFactor +
    0.2 * speedFactor +
    0.15 * tempFactor;

  const tireHealth = Math.min(100, Math.max(0, +(weightedScore * 100).toFixed(1)));

  // === TREND STATUS ===
  const getTrend = () => {
    if (tireHealth >= 80) return { icon: TrendingUp, text: 'Excellent', class: 'status-good' };
    if (tireHealth >= 60) return { icon: TrendingUp, text: 'Good', class: 'text-primary' };
    if (tireHealth >= 40) return { icon: TrendingDown, text: 'Fair', class: 'status-warning' };
    return { icon: TrendingDown, text: 'Poor', class: 'status-critical' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  // === SMART RECOMMENDATIONS ===
  const getRecommendations = () => {
    const recs: string[] = [];

    if (avgPressure < 35)
      recs.push('Increase tire pressure slightly (35–40 PSI recommended).');
    else if (avgPressure > 40)
      recs.push('Reduce tire pressure slightly (overinflation can cause blowouts).');

    if (load > 25)
      recs.push('High load detected — reduce to below 25 tons for tire safety.');
    else if (load < 10)
      recs.push('Low load may cause uneven tread wear — maintain balanced cargo.');

    if (speed > 80)
      recs.push('High speed detected — maintain below 80 km/h for longer tire life.');
    else if (speed < 20)
      recs.push('Very low speed for long durations can cause flat spots — vary speed periodically.');

    if (temperature > 85)
      recs.push('Overheating detected — check engine cooling or reduce speed/load.');
    else if (temperature < 20)
      recs.push('Cold temperature detected — tires may harden, warm up before driving.');

    if (recs.length === 0)
      recs.push('All conditions optimal — great driving conditions!');

    return recs;
  };

  const estimatedLifeKm = Math.round((tireHealth / 100) * 60000);

  const factors = [
    { label: 'Pressure', value: pressureFactor },
    { label: 'Load', value: loadFactor },
    { label: 'Speed', value: speedFactor },
    { label: 'Temperature', value: tempFactor },
  ];

  return (
    <div className="glass-panel p-6 space-y-6 animate-slide-up">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2 glow-primary">
          <Brain className="h-5 w-5" />
          AI Tire Health Prediction
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Realistic simulation using physical condition parameters.
        </p>
      </div>

      {/* Tire Health Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Predicted Tire Health</span>
          <div className="flex items-center gap-2">
            <TrendIcon className={`h-4 w-4 ${trend.class}`} />
            <span className={`font-bold ${trend.class}`}>{tireHealth}%</span>
          </div>
        </div>
        <Progress value={tireHealth} className="h-3" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Condition:</span>
          <span className={`font-semibold ${trend.class}`}>{trend.text}</span>
        </div>
      </div>

      {/* Impact Factors */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Impact Factors</h3>
        <div className="grid grid-cols-2 gap-3">
          {factors.map(({ label, value }) => (
            <div key={label} className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div
                className={`font-bold ${value > 0.8 ? 'status-good' : value > 0.6 ? 'text-primary' : 'status-warning'
                  }`}
              >
                {(value * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
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

      {/* Estimated Life */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 rounded-lg border border-primary/30">
        <div className="text-xs text-muted-foreground mb-1">Estimated Remaining Life</div>
        <div className="text-2xl font-bold text-primary">{estimatedLifeKm.toLocaleString()} km</div>
        <div className="text-xs text-muted-foreground mt-1">
          Based on current operational stress and wear rate.
        </div>
      </div>
    </div>
  );
}
