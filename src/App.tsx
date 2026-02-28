import { ControlPanel } from "@/components/control-panel";
import { Visualization3D } from "@/components/visualization-3d";

function App() {
  return (
    <main className="h-screen w-screen bg-background overflow-hidden">
      <ControlPanel />
      <Visualization3D />
    </main>
  );
}

export default App;
