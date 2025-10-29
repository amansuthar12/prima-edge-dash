import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Power, CloudRain, Gauge, Weight, Thermometer } from 'lucide-react';

interface ControlPanelProps {
  engineOn: boolean;
  setEngineOn: (value: boolean) => void;
  rainActive: boolean;
  setRainActive: (value: boolean) => void;
  speed: number;
  setSpeed: (value: number) => void;
  load: number;
  setLoad: (value: number) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  tirePressures: number[];
  setTirePressures: (value: number[]) => void;
}

export function ControlPanel({
  engineOn,
  setEngineOn,
  rainActive,
  setRainActive,
  speed,
  setSpeed,
  load,
  setLoad,
  temperature,
  setTemperature,
  tirePressures,
  setTirePressures,
}: ControlPanelProps) {
  return (
    <div className="glass-panel p-6 space-y-6 animate-slide-up">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2 glow-primary">
          <Gauge className="h-5 w-5" />
          Control Panel
        </h2>
      </div>

      {/* Engine Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Power className={`h-4 w-4 ${engineOn ? 'text-primary animate-pulse-glow' : ''}`} />
            Truck Engine
          </Label>
          <Switch checked={engineOn} onCheckedChange={setEngineOn} />
        </div>
        <div className="text-xs text-muted-foreground pl-6">
          Status: <span className={engineOn ? 'status-good' : 'text-muted-foreground'}>
            {engineOn ? 'RUNNING' : 'STOPPED'}
          </span>
        </div>
      </div>

      {/* Rain Simulation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <CloudRain className={`h-4 w-4 ${rainActive ? 'text-primary animate-pulse-glow' : ''}`} />
            Rain Simulation
          </Label>
          <Switch checked={rainActive} onCheckedChange={setRainActive} />
        </div>
        <div className="text-xs text-muted-foreground pl-6">
          {rainActive ? 'Tarpaulin deployed • Weather: Rainy' : 'Weather: Clear'}
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Gauge className="h-4 w-4" />
            Speed
          </Label>
          <span className="text-primary font-mono font-bold">{speed} km/h</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={(value) => setSpeed(value[0])}
          max={120}
          step={5}
          className="w-full"
        />
      </div>

      {/* Load Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Weight className="h-4 w-4" />
            Load Weight
          </Label>
          <span className="text-primary font-mono font-bold">{load} tons</span>
        </div>
        <Slider
          value={[load]}
          onValueChange={(value) => setLoad(value[0])}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      {/* Temperature Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Thermometer className="h-4 w-4" />
            Temperature
          </Label>
          <span className={`font-mono font-bold ${
            temperature > 90 ? 'status-critical' : temperature > 75 ? 'status-warning' : 'status-good'
          }`}>
            {temperature}°C
          </span>
        </div>
        <Slider
          value={[temperature]}
          onValueChange={(value) => setTemperature(value[0])}
          min={20}
          max={110}
          step={1}
          className="w-full"
        />
      </div>

      {/* Tire Pressures */}
      <div className="space-y-4">
        <Label className="text-foreground font-semibold">Individual Tire Pressure (PSI)</Label>
        
        {['Front Left', 'Front Right', 'Rear Left', 'Rear Right'].map((tire, index) => (
          <div key={tire} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{tire}</span>
              <span className={`text-sm font-mono font-bold ${
                tirePressures[index] < 30 ? 'status-critical' : 
                tirePressures[index] < 35 ? 'status-warning' : 'status-good'
              }`}>
                {tirePressures[index]} PSI
              </span>
            </div>
            <Slider
              value={[tirePressures[index]]}
              onValueChange={(value) => {
                const newPressures = [...tirePressures];
                newPressures[index] = value[0];
                setTirePressures(newPressures);
              }}
              min={25}
              max={45}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* RPM Indicator */}
      {engineOn && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Engine RPM</span>
            <span className="text-primary font-mono font-bold animate-pulse-glow">
              {Math.round(800 + speed * 20)} RPM
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${(speed / 120) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
