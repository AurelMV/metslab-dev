import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
//import "./index.css";
import App from "./App";
//import Visor3d from "./Visor3D";
import "leaflet/dist/leaflet.css";

//import CrearModelo from "./pages/CrearModelo";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
