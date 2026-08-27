/** App entry — mounts the sermon site into #root. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initClarity } from "./lib/clarity";
import "./index.css";
import App from "./App.tsx";

initClarity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
