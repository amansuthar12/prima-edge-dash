import { Gauge, Droplet, Weight, Thermometer, Wind, CloudRain } from 'lucide-react';

interface StatusWidgetsProps {
  speed: number;
  load: number;
  temperature: number;
  tirePressures: number[];
  fuelLevel: number;
  rainActive: boolean;
}

export function StatusWidgets({
  speed,
  load,
  temperature,
  tirePressures,
  fuelLevel,
  rainActive,
}: StatusWidgetsProps) {
  const avgTirePressure = Math.round(tirePressures.reduce((a, b) => a + b, 0) / tirePressures.length);
  const maxLoad = 30;
  const maxTemp = 110;

  const widgets = [
    {
      icon: Wind,
      label: 'Avg Tire Pressure',
      value: `${avgTirePressure} PSI`,
      status: avgTirePressure < 30 ? 'critical' : avgTirePressure < 35 ? 'warning' : 'good',
      progress: (avgTirePressure / 45) * 100,
    },
    {
      icon: Droplet,
      label: 'Fuel Level',
      value: `${fuelLevel}%`,
      status: fuelLevel < 20 ? 'critical' : fuelLevel < 40 ? 'warning' : 'good',
      progress: fuelLevel,
    },
    {
      icon: Weight,
      label: 'Load Weight',
      value: `${load} tons`,
      status: load > 25 ? 'warning' : 'good',
      progress: (load / maxLoad) * 100,
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: `${temperature}°C`,
      status: temperature > 90 ? 'critical' : temperature > 75 ? 'warning' : 'good',
      progress: (temperature / maxTemp) * 100,
    },
    {
      icon: Gauge,
      label: 'Speed',
      value: `${speed} km/h`,
      status: speed > 100 ? 'warning' : 'good',
      progress: (speed / 120) * 100,
    },
    {
      icon: CloudRain,
      label: 'Weather',
      value: rainActive ? 'Rainy' : 'Clear',
      status: rainActive ? 'warning' : 'good',
      progress: rainActive ? 100 : 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 animate-slide-up">
      {widgets.map((widget, index) => {
        const Icon = widget.icon;
        const statusClass = 
          widget.status === 'critical' ? 'status-critical' :
          widget.status === 'warning' ? 'status-warning' : 'status-good';

        return (
          <div 
            key={widget.label} 
            className="glass-panel p-4 hover:scale-105 transition-transform duration-200"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`h-5 w-5 ${statusClass}`} />
              <span className={`text-xl font-bold font-mono ${statusClass}`}>
                {widget.value}
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">{widget.label}</div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    widget.status === 'critical' ? 'bg-destructive' :
                    widget.status === 'warning' ? 'bg-secondary' : 'bg-primary'
                  }`}
                  style={{ width: `${widget.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
