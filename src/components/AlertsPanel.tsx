import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlertsPanelProps {
  tirePressures: number[];
  fuelLevel: number;
  temperature: number;
  load: number;
  speed: number;
}

export function AlertsPanel({
  tirePressures,
  fuelLevel,
  temperature,
  load,
  speed,
}: AlertsPanelProps) {
  const alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }> = [];

  // Check tire pressures
  tirePressures.forEach((pressure, index) => {
    const tireNames = ['Front Left', 'Front Right', 'Rear Left', 'Rear Right'];
    if (pressure < 30) {
      alerts.push({
        severity: 'critical',
        message: `Critical: Low pressure in ${tireNames[index]} tire (${pressure} PSI)`,
      });
    } else if (pressure < 35) {
      alerts.push({
        severity: 'warning',
        message: `Warning: ${tireNames[index]} tire pressure below optimal (${pressure} PSI)`,
      });
    }
  });

  // Check fuel level
  if (fuelLevel < 20) {
    alerts.push({
      severity: 'critical',
      message: `Critical: Fuel level critically low (${fuelLevel}%)`,
    });
  } else if (fuelLevel < 40) {
    alerts.push({
      severity: 'warning',
      message: `Warning: Fuel level running low (${fuelLevel}%)`,
    });
  }

  // Check temperature
  if (temperature > 95) {
    alerts.push({
      severity: 'critical',
      message: `Critical: Engine temperature too high (${temperature}°C)`,
    });
  } else if (temperature > 85) {
    alerts.push({
      severity: 'warning',
      message: `Warning: Engine temperature elevated (${temperature}°C)`,
    });
  }

  // Check load
  if (load > 27) {
    alerts.push({
      severity: 'critical',
      message: `Critical: Load exceeds recommended limit (${load} tons)`,
    });
  } else if (load > 25) {
    alerts.push({
      severity: 'warning',
      message: `Warning: High load detected (${load} tons)`,
    });
  }

  // Check speed
  if (speed > 100) {
    alerts.push({
      severity: 'warning',
      message: `Warning: High speed detected (${speed} km/h)`,
    });
  }

  // Add info message if no alerts
  if (alerts.length === 0) {
    alerts.push({
      severity: 'info',
      message: 'All systems operating normally',
    });
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 status-critical" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 status-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 status-good" />;
    }
  };

  const getAlertVariant = (severity: string): "default" | "destructive" => {
    return severity === 'critical' ? 'destructive' : 'default';
  };

  return (
    <div className="glass-panel p-6 space-y-4 animate-slide-up">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2 glow-primary">
          <Info className="h-5 w-5" />
          Active Alerts ({alerts.length})
        </h2>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {alerts.map((alert, index) => (
          <Alert 
            key={index} 
            variant={getAlertVariant(alert.severity)}
            className={`animate-slide-up ${
              alert.severity === 'critical' ? 'border-destructive/50' :
              alert.severity === 'warning' ? 'border-secondary/50' :
              'border-primary/30'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {getAlertIcon(alert.severity)}
            <AlertDescription className="ml-2">
              {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Summary footer */}
      <div className="pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
        <div className="bg-destructive/10 rounded p-2">
          <div className="text-xs text-muted-foreground">Critical</div>
          <div className="text-lg font-bold status-critical">
            {alerts.filter(a => a.severity === 'critical').length}
          </div>
        </div>
        <div className="bg-secondary/10 rounded p-2">
          <div className="text-xs text-muted-foreground">Warning</div>
          <div className="text-lg font-bold status-warning">
            {alerts.filter(a => a.severity === 'warning').length}
          </div>
        </div>
        <div className="bg-primary/10 rounded p-2">
          <div className="text-xs text-muted-foreground">Info</div>
          <div className="text-lg font-bold status-good">
            {alerts.filter(a => a.severity === 'info').length}
          </div>
        </div>
      </div>
    </div>
  );
}
