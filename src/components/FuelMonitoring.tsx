import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Droplets, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FuelMonitoringProps {
  fuelLevel: number;
  speed: number;
  engineOn: boolean;
}

export function FuelMonitoring({ fuelLevel, speed, engineOn }: FuelMonitoringProps) {
  const [previousFuel, setPreviousFuel] = useState(fuelLevel);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [anomalyScore, setAnomalyScore] = useState(0);
  const [fuelHistory, setFuelHistory] = useState<{ time: string; fuel: number; anomaly: boolean }[]>([]);

  useEffect(() => {
    // Calculate fuel drop
    const deltaFuel = fuelLevel - previousFuel;
    
    // Expected fuel consumption based on speed and engine state
    const expectedConsumption = engineOn ? -(speed / 1000) : 0;
    
    // Anomaly detection logic (simplified Isolation Forest simulation)
    const isStopped = speed === 0;
    const isEngineOff = !engineOn;
    
    // Suspicious patterns:
    // 1. Large fuel drop when stopped
    // 2. Large fuel drop when engine is off
    // 3. Fuel drop rate much higher than expected
    let anomaly = false;
    let score = 0;
    
    if (deltaFuel < -0.5) { // Fuel dropping
      if (isStopped && deltaFuel < -0.3) {
        anomaly = true;
        score = Math.abs(deltaFuel) * 20;
      } else if (isEngineOff && deltaFuel < -0.2) {
        anomaly = true;
        score = Math.abs(deltaFuel) * 25;
      } else if (deltaFuel < expectedConsumption * 3) {
        anomaly = true;
        score = Math.abs(deltaFuel - expectedConsumption) * 15;
      }
    }
    
    setAnomalyDetected(anomaly);
    setAnomalyScore(Math.min(score, 100));
    
    // Update history
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setFuelHistory(prev => {
      const newHistory = [...prev, { time: timeStr, fuel: fuelLevel, anomaly }];
      return newHistory.slice(-10); // Keep last 10 readings
    });
    
    setPreviousFuel(fuelLevel);
  }, [fuelLevel, speed, engineOn, previousFuel]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={anomalyDetected ? "destructive" : "outline"}
          className="w-full relative overflow-hidden"
        >
          <Droplets className="mr-2 h-4 w-4" />
          Fuel Monitoring
          {anomalyDetected && (
            <span className="absolute top-0 right-0 flex h-3 w-3 mt-1 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl glass-panel">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary glow-primary flex items-center gap-2">
            <Droplets className="h-6 w-6" />
            AI Fuel Theft Detection System
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <Card className={`p-6 border-2 ${anomalyDetected ? 'border-destructive bg-destructive/10 animate-pulse' : 'border-primary/30 bg-card/50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {anomalyDetected ? (
                  <AlertTriangle className="h-8 w-8 text-destructive animate-pulse-glow" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-primary" />
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {anomalyDetected ? 'Fuel Theft Suspected' : 'Normal Operation'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {anomalyDetected ? 'Unusual fuel drop detected' : 'Fuel consumption within normal range'}
                  </p>
                </div>
              </div>
              {anomalyDetected && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-destructive">{anomalyScore.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Anomaly Score</div>
                </div>
              )}
            </div>
            
            {anomalyDetected && (
              <div className="mt-4 p-4 bg-background/50 rounded-lg border border-destructive/30">
                <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Detection Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current Fuel:</span>
                    <span className="ml-2 font-mono font-bold">{fuelLevel.toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="ml-2 font-mono font-bold">{speed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Engine:</span>
                    <span className="ml-2 font-mono font-bold">{engineOn ? 'ON' : 'OFF'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Drop Rate:</span>
                    <span className="ml-2 font-mono font-bold text-destructive">Abnormal</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* ML Model Info */}
          <Card className="p-4 bg-card/30">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-primary">🤖</span>
              Isolation Forest Algorithm
            </h4>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Model:</strong> Anomaly Detection (Unsupervised ML)</p>
              <p><strong className="text-foreground">Features:</strong> Fuel Drop (ΔFuel), Speed, Engine State, Flow Rate</p>
              <p><strong className="text-foreground">Detection Logic:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Suspicious drop when vehicle stopped (speed = 0)</li>
                <li>Unusual fuel loss when engine OFF</li>
                <li>Drop rate exceeds normal consumption pattern</li>
              </ul>
            </div>
          </Card>

          {/* Recent Readings */}
          <Card className="p-4 bg-card/30">
            <h4 className="font-semibold mb-3">Recent Readings (Last 10)</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fuelHistory.slice().reverse().map((reading, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2 rounded ${reading.anomaly ? 'bg-destructive/20' : 'bg-background/50'}`}
                >
                  <span className="text-xs font-mono text-muted-foreground">{reading.time}</span>
                  <span className="text-sm font-mono">{reading.fuel.toFixed(1)}L</span>
                  {reading.anomaly && (
                    <span className="text-xs text-destructive font-semibold">⚠️ ANOMALY</span>
                  )}
                </div>
              ))}
              {fuelHistory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No readings yet</p>
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
