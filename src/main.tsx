import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

// Apply saved color theme on load
const savedTheme = localStorage.getItem("nutrichef-color-theme") || "fresh";
document.documentElement.setAttribute("data-color-theme", savedTheme);

createRoot(document.getElementById("root")!).render(<App />);
