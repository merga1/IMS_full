import { createRoot } from "react-dom/client";
import App from "./app/router";
import "./index.css";
import "./app/i18n";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { LanguageProvider } from "./app/providers/LanguageProvider";

createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="system" storageKey="mesob-ui-theme">
        <LanguageProvider>
            <App />
        </LanguageProvider>
    </ThemeProvider>
);
