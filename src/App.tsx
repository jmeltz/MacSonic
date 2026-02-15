import { AppLayout } from "./components/layout/AppLayout";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

function App() {
  useKeyboardShortcuts();

  return <AppLayout />;
}

export default App;
