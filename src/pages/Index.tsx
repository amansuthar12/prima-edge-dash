import { useState, useEffect } from 'react';
import { TataPrimaTruck } from '@/components/TataPrimaTruck';
import { ControlPanel } from '@/components/ControlPanel';
import { StatusWidgets } from '@/components/StatusWidgets';
import { MLPrediction } from '@/components/MLPrediction';
import { TrendsChart } from '@/components/TrendsChart';
import { AlertsPanel } from '@/components/AlertsPanel';
import { AIAssistant } from '@/components/AIAssistant';
import { FuelMonitoring } from '@/components/FuelMonitoring';

const Index = () => {
  // State management
  const [engineOn, setEngineOn] = useState(false);
  const [rainActive, setRainActive] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [load, setLoad] = useState(15);
  const [temperature, setTemperature] = useState(75);
  const [tirePressures, setTirePressures] = useState([38, 38, 38, 38]);
  const [fuelLevel, setFuelLevel] = useState(85);

  // Simulate fuel consumption
  useEffect(() => {
    if (engineOn && speed > 0) {
      const interval = setInterval(() => {
        setFuelLevel((prev) => Math.max(0, prev - (speed / 1000)));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [engineOn, speed]);

  // Simulate temperature changes based on load and speed
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature((prev) => {
        // Base temp + load impact + speed impact
        const targetTemp = 60 + (load * 1.2) + (speed / 3);
        if (prev < targetTemp) return Math.min(targetTemp, prev + 0.5);
        if (prev > targetTemp) return Math.max(targetTemp, prev - 0.5);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [speed, load]);

  const avgTirePressure = Math.round(tirePressures.reduce((a, b) => a + b, 0) / tirePressures.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F18] to-[#101820] grid-bg">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent glow-primary">
              AI-Based Smart Truck Monitoring System
            </h1>
            <p className="text-muted-foreground text-lg">
              <span className="text-primary font-semibold">TechnoEdge Solutions</span> — Innovate. Implement. Inspire.
            </p>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Control Panel */}
          <div className="lg:col-span-3 space-y-6">
            <ControlPanel
              engineOn={engineOn}
              setEngineOn={setEngineOn}
              rainActive={rainActive}
              setRainActive={setRainActive}
              speed={speed}
              setSpeed={setSpeed}
              load={load}
              setLoad={setLoad}
              temperature={temperature}
              setTemperature={setTemperature}
              tirePressures={tirePressures}
              setTirePressures={setTirePressures}
            />
          </div>

          {/* Center Column - 3D Visualization */}
          <div className="lg:col-span-6 space-y-6">
            {/* 3D Truck Display */}
            <div className="glass-panel p-6 animate-slide-up">
              <div className="aspect-video rounded-lg overflow-hidden border border-border/50 bg-background/50">
                <TataPrimaTruck
                  engineOn={engineOn}
                  rainActive={rainActive}
                  speed={speed}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>🖱️ Drag to rotate</span>
                <span>•</span>
                <span>🔍 Scroll to zoom</span>
                <span>•</span>
                <span>👆 Click & drag to pan</span>
              </div>
            </div>

            {/* Status Widgets */}
            <StatusWidgets
              speed={speed}
              load={load}
              temperature={temperature}
              tirePressures={tirePressures}
              fuelLevel={fuelLevel}
              rainActive={rainActive}
            />

            {/* AI Assistant */}
            <AIAssistant
              tirePressures={tirePressures}
              fuelLevel={fuelLevel}
              temperature={temperature}
              load={load}
              speed={speed}
              engineOn={engineOn}
            />

            {/* Fuel Monitoring Button */}
            <div className="glass-panel p-6 animate-slide-up">
              <FuelMonitoring
                fuelLevel={fuelLevel}
                speed={speed}
                engineOn={engineOn}
              />
            </div>
          </div>

          {/* Right Column - Analytics & Alerts */}
          <div className="lg:col-span-3 space-y-6">
            <MLPrediction
              tirePressures={tirePressures}
              load={load}
              speed={speed}
              temperature={temperature}
            />

            <TrendsChart
              currentTirePressure={avgTirePressure}
              currentFuelLevel={fuelLevel}
            />

            <AlertsPanel
              tirePressures={tirePressures}
              fuelLevel={fuelLevel}
              temperature={temperature}
              load={load}
              speed={speed}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-lg bg-card/30 mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 TechnoEdge Solutions • Project Expo 2025-26</p>
            <p className="text-xs mt-1">Powered by AI & IoT Technologies</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
