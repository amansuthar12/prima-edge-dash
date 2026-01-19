import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TrendsChartProps {
  currentTirePressure: number;
  currentFuelLevel: number;
}

interface DataPoint {
  time: string;
  tirePressure: number;
  fuelLevel: number;
}

export function TrendsChart({ currentTirePressure, currentFuelLevel }: TrendsChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);

  // Update instantly whenever props change
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Add a tiny jitter for realism (sensor-like noise)
    const pressureJitter = (Math.random() - 0.5) * 0.3;
    const fuelJitter = (Math.random() - 0.5) * 0.4;

    const newPressure = Math.max(30, Math.min(45, currentTirePressure + pressureJitter));
    const newFuel = Math.max(0, Math.min(300, currentFuelLevel + fuelJitter));

    setData(prevData => {
      const newData = [
        ...prevData,
        {
          time: timeStr,
          tirePressure: parseFloat(newPressure.toFixed(1)),
          fuelLevel: parseFloat(newFuel.toFixed(1)),
        },
      ];
      return newData.slice(-20); // Keep last 20 readings
    });
  }, [currentTirePressure, currentFuelLevel]); // 👈 Updates IMMEDIATELY on value change

  return (
    <div className="glass-panel p-6 space-y-4 animate-slide-up">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2 glow-primary">
          <TrendingUp className="h-5 w-5" />
          Real-Time Trends
        </h2>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '10px',
              }}
            />
            <Line
              type="monotone"
              dataKey="tirePressure"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Tire Pressure (PSI)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="fuelLevel"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              dot={false}
              name="Fuel Level (L)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Current Tire Pressure</div>
          <div className="text-2xl font-bold text-primary">
            {currentTirePressure.toFixed(1)} PSI
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Current Fuel Level</div>
          <div className="text-2xl font-bold text-secondary">
            {currentFuelLevel.toFixed(1)}L
          </div>
        </div>
      </div>
    </div>
  );
}
