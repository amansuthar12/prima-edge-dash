import { Switch } from '@/components/ui/switch'; // Assuming shadcn/ui or similar
import { Slider } from '@/components/ui/slider'; // Assuming shadcn/ui or similar
import { Label } from '@/components/ui/label';   // Assuming shadcn/ui or similar
import { Power, CloudRain, Gauge, Weight, Thermometer, Fuel } from 'lucide-react';
import { useEffect } from 'react';

interface ControlPanelProps {
  engineOn: boolean;
  setEngineOn: (value: boolean) => void;
  rainActive: boolean;
  setRainActive: (value: boolean) => void;
  speed: number;
  setSpeed: (value: number) => void;
  load: number;
  setLoad: (value: number) => void;
  fuelLevel: number;
  setFuelLevel: (value: number) => void;
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
  fuelLevel,
  setFuelLevel,
  temperature,
  setTemperature,
  tirePressures,
  setTirePressures,
}: ControlPanelProps) {
  useEffect(() => {
    if (fuelLevel <= 0 && engineOn) {
      setEngineOn(false);
      alert('⚠️ Fuel Empty — Engine stopped automatically!');
    }
  }, [fuelLevel, engineOn, setEngineOn]);
  // realistic, stable temperature simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const ambient = 30; // ambient base temperature (°C)

    // Helper: Compute target tyre temperature
    const computeTargetTyreTemp = () => {
      // If the truck is stationary, tyres cool toward ambient
      if (speed < 5) return ambient;

      // Frictional heating increases with load & speed
      // Example: baseline + load & speed contribution
      const baseHeat = 35; // baseline for light movement
      const loadEffect = (load / 30) * 40; // max +40°C at 30 tons
      const speedEffect = (speed / 120) * 45; // max +45°C at 120 km/h
      const rainCooling = rainActive ? -8 : 0; // rain cools tyres ~8°C

      const target = baseHeat + loadEffect + speedEffect + rainCooling;

      // Clamp realistic tyre range (30°C - 110°C)
      return Math.max(ambient, Math.min(target, 110));
    };

    // smooth factor for realism
    const alpha = 0.08;
    const noiseAmp = 0.5; // slight jitter for realism

    interval = setInterval(() => {
      setTemperature(prev => {
        const target = computeTargetTyreTemp();
        const diff = target - prev;

        // Approach target smoothly
        let next = prev + diff * alpha;

        // Small random noise
        next += (Math.random() - 0.5) * noiseAmp;

        // Cooling if stationary
        if (speed < 5) {
          const coolStep = (ambient - prev) * 0.1;
          next = prev + coolStep;
        }

        // Clamp and return
        return Math.round(Math.max(ambient, Math.min(110, next)) * 10) / 10;
      });
    }, 1000);

    // Stop when engine off (no heating source, cool tyres)
    if (!engineOn) {
      setTemperature(ambient);
    }

    return () => clearInterval(interval);
  }, [engineOn, speed, load, rainActive, setTemperature]);


  return (
    <div className="glass-panel p-6 space-y-6 animate-slide-up">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2 glow-primary">
          <Gauge className="h-5 w-5" />
          Control Panel
        </h2>
      </div>

      {/* 🔌 Engine Toggle */}
      <div className="glass-panel p-6 space-y-6 animate-slide-up">
        {/* 🔌 Engine Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-foreground">
              <Power className={`h-4 w-4 ${engineOn ? 'text-primary animate-pulse-glow' : ''}`} />
              Truck Engine
            </Label>
            <Switch checked={engineOn} onCheckedChange={setEngineOn} />
          </div>
          <div className="text-xs text-muted-foreground pl-6">
            Status:{' '}
            <span className={engineOn ? 'status-good' : 'text-muted-foreground'}>
              {engineOn ? 'RUNNING' : fuelLevel <= 0 ? 'STOPPED (NO FUEL)' : 'STOPPED'}
            </span>
          </div>
        </div>

        {/* 🌧️ Rain Simulation */}
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
      </div>
      {/* 🚛 Speed Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Gauge className="h-4 w-4" />
            Speed
          </Label>
          <span className="text-primary font-mono font-bold">{speed.toFixed(1)} km/h</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={(value) => setSpeed(value[0])}
          max={120}
          step={5}
          className="w-full"
          disabled={!engineOn}
        />
        {!engineOn && (
          <p className="text-xs text-muted-foreground pl-6">
            Engine is off — speed control disabled
          </p>
        )}
      </div>

      {/* ⚖️ Load Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Weight className="h-4 w-4" />
            Load Weight
          </Label>
          <span className="text-primary font-mono font-bold">{load.toFixed(1)} tons</span>
        </div>
        <Slider
          value={[load]}
          onValueChange={(value) => setLoad(value[0])}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      {/* ⛽ Fuel Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Fuel className="h-4 w-4" />
            Fuel Level
          </Label>
          <span
            className={`font-mono font-bold ${fuelLevel < 20 ? 'status-critical' :
              fuelLevel < 40 ? 'status-warning' : 'status-good'
              }`}
          >
            {fuelLevel.toFixed(1)} L
          </span>
        </div>
        <Slider
          value={[fuelLevel]}
          onValueChange={(value) => setFuelLevel(value[0])}
          max={300}
          step={5}
          className="w-full"
        />
      </div>

      {/* 🌡️ Temperature */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Thermometer className="h-4 w-4" />
            Temperature
          </Label>
          <span
            className={`font-mono font-bold ${temperature > 90 ? 'status-critical' :
              temperature > 75 ? 'status-warning' : 'status-good'
              }`}
          >
            {temperature.toFixed(1)}°C
          </span>
        </div>
        <Slider
          value={[temperature]}
          onValueChange={(value) => setTemperature(value[0])}
          min={20}
          max={110}
          step={1}
          className="w-full"
          disabled={!engineOn}
        />
      </div>

      {/* 🛞 Tire Pressures */}
      <div className="space-y-4">
        <Label className="text-foreground font-semibold">Individual Tire Pressure (PSI)</Label>
        {['Front Left', 'Front Right', 'Rear Left', 'Rear Right'].map((tire, index) => (
          <div key={tire} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{tire}</span>
              <span
                className={`text-sm font-mono font-bold ${tirePressures[index] < 30
                  ? 'status-critical'
                  : tirePressures[index] < 35
                    ? 'status-warning'
                    : 'status-good'
                  }`}
              >
                {tirePressures[index].toFixed(1)} PSI
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

      {/* ⚙️ RPM Indicator */}
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