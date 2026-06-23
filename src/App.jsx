import { useEffect } from "react";
import MasterMindsLoader from "./components/MasterMindsLoader";
import { useSession } from "./contexts/SessionContext";
import AppRoutes from "./routes/AppRoutes";

/** Application shell — route tree lives in src/routes (WIMS-style). */
function App() {
  const { loading, restored } = useSession();

  useEffect(() => {
    console.log("[App] mounted");
    return () => console.log("[App] unmounted");
  }, []);

  return (
    <MasterMindsLoader isLoading={loading || !restored}>
      <AppRoutes />
    </MasterMindsLoader>
  );
}

export default App;
