import "./App.css";
import { SystemUsage } from "./components/SystemUsage";

function App() {
  return (
    <main className="container" data-tauri-drag-region>
      <SystemUsage />
      {/* TODO: 付箋メモウィジェット */}
    </main>
  );
}

export default App;
