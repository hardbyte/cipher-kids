import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />

    <div className="" />
    <p className="text-sm text-gray-500">No adults allowed.</p>
  </StrictMode>,
);
